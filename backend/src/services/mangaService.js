'use strict';
/**
 * MANGA DOMAIN SERVICE
 *
 * Orchestrates: ingestion → normalization → cache → DB upsert → response.
 * All chapter data leaving this service is guaranteed normalized.
 */

const prisma = require('../lib/prisma');
const ingestion = require('./ingestionLayer');
const { normalize } = require('./normalization');
const cache = require('./cacheLayer');
const config = require('../config/env');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * 🛡️ Bandwidth Shield: Transforms any image URL to use the Cloudflare Worker proxy
 */
function imageShield(url) {
  if (!url) return url;
  
  // Safe domains that allow direct hotlinking without proxying
  const SAFE_DOMAINS = [
    'image.tmdb.org',
    'imgur.com',
    'blogspot.com',
    'googleusercontent.com',
    'placehold.co',
    'wp.com',
    'i0.wp.com',
    'i1.wp.com',
    'i2.wp.com',
    'i3.wp.com'
  ];

  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const isSafe = SAFE_DOMAINS.some(d => host === d || host.endsWith('.' + d));
    if (isSafe) {
      return url; // Return direct link to save backend bandwidth and load instantly
    }
  } catch (e) {
    // fallback to default behavior if invalid URL format
  }

  if (!config.imageProxyUrl || url.includes(config.imageProxyUrl)) return url;
  return `${config.imageProxyUrl}?url=${encodeURIComponent(url)}`;
}

// Cache globalNsfw setting in-memory for 30s to prevent constant DB reads
let _cachedGlobalNsfw = { value: false, expiresAt: 0 };

async function applyContentFilters(results, userId = null, isExplicitSearch = false) {
  if (!results || results.length === 0) return [];

  let globalNsfw = _cachedGlobalNsfw.value;
  let hiddenSet = new Set();

  try {
    // 1. Fetch Global Settings (Cached)
    if (Date.now() > _cachedGlobalNsfw.expiresAt) {
      const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ['globalNsfw'] } }
      });
      globalNsfw = settings.find(s => s.key === 'globalNsfw')?.value === 'true';
      _cachedGlobalNsfw = { value: globalNsfw, expiresAt: Date.now() + 30_000 };
    }

    // 2. Filter out hidden manga from local DB
    const hiddenIds = await prisma.manga.findMany({
      where: { id: { in: results.map(r => r.id) }, isHidden: true },
      select: { id: true }
    });
    hiddenSet = new Set(hiddenIds.map(h => h.id));
  } catch (dbErr) {
    console.warn('[MangaService] DB Connection failed during content filtering, falling back to safe defaults:', dbErr.message);
    // On DB failure (e.g. pool exhausted), default to globalNsfw = true (NSFW hidden)
    globalNsfw = true;
  }

  // Filter out any corrupted entries (e.g. title is 'Unknown Title', empty, or matches ID)
  let filtered = results.filter(m => m && m.title && m.title !== 'Unknown Title' && m.title !== m.id && !hiddenSet.has(m.id));

  // 3. Apply NSFW filters
  // ⚡ Rule: If it's an explicit search, we allow everything. 
  // Otherwise, we filter based on user settings or guest status.
  if (!isExplicitSearch) {
    if (globalNsfw) {
      filtered = filtered.filter(m => !m.nsfw);
    } else if (userId) {
      try {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { nsfw: true } });
        if (user && !user.nsfw) {
          filtered = filtered.filter(m => !m.nsfw);
        }
      } catch (err) {
        console.warn('[MangaService] DB Connection failed checking user settings, hiding NSFW by default:', err.message);
        filtered = filtered.filter(m => !m.nsfw);
      }
    } else {
      // Guest users hide NSFW by default in browse/related
      filtered = filtered.filter(m => !m.nsfw);
    }
  }

  return filtered;
}

async function applyContentFiltersToBrowseResult(data, userId, isExplicit = false) {
  if (!data || !data.results) return data;
  const filtered = await applyContentFilters(data.results, userId, isExplicit);
  return { ...data, results: filtered };
}

/**
 * Map raw Consumet manga result → our internal Manga shape.
 */
function mapManga(raw) {
  return {
    id: raw.id,
    title: raw.title || 'Unknown Title',
    cover: imageShield(raw.image || raw.cover || null),
    description: raw.description || null,
    status: raw.status || null,
    genres: Array.isArray(raw.genres) ? raw.genres : [],
    nsfw: !!(() => {
      const STRICT_BLACKLIST = [
        '18+', 'smut', 'erotica', 'sexual-violence', 'sexual violence', 'yaoi', 'yuri',
        'incest', 'ecchi', 'hentai', 'pornographic', 'loli', 'shota'
      ];
      const BORDERLINE_TAGS = ['harem', 'adult', 'mature', 'josei', 'gore'];
      
      const genreList = (Array.isArray(raw.genres) ? raw.genres : []).map(g => 
        (typeof g === 'string' ? g : '').toLowerCase().trim()
      );
      
      const hasStrict = genreList.some(tag => 
        STRICT_BLACKLIST.some(bad => tag === bad || tag.includes(bad))
      );
      const hasGenres = genreList.length > 0;
      if (hasStrict || raw.isAdult || (!hasGenres && raw.nsfw)) {
        return true;
      }
      
      const borderlineCount = genreList.filter(tag => 
        BORDERLINE_TAGS.some(border => tag === border || tag.includes(border))
      ).length;
      
      return borderlineCount > 1;
    })(),
    rating: raw.rating || null,
    lastChapter: raw.lastChapter || null,
    lastChapterId: raw.lastChapterId || null,
    updateDate: raw.updateDate || null,
    source: raw.source || 'mangadex',
    popularity: raw.popularity ? {
      score: raw.popularity.score,
      readChapters: raw.popularity.totalReadChapters,
      users: raw.popularity.uniqueUsersCount,
      totalChapters: raw.popularity.totalChapters
    } : null
  };
}

/**
 * Map raw Consumet chapter → our internal Chapter shape (pre-normalization).
 */
function mapRawChapter(raw, mangaId) {
  return {
    id: raw.id,
    chapterNumber: raw.chapterNumber || raw.chapter || raw.number,
    title: raw.title || raw.chapterTitle || null,
    pages: raw.pages || [],
    releasedAt: raw.releasedAt || null,
    source: raw.source || 'mangadex',
    mangaId,
  };
}

// ── Service Methods ───────────────────────────────────────────────────────────

async function search(query, page = 1, userId = null) {
  // 1. Scraper search
  let scraperResults = [];
  try {
    const { data } = await ingestion.searchManga(query, page);
    scraperResults = (data.results || data || []).map(mapManga);
  } catch (err) {
    console.warn('[MangaService] Scraper search failed:', err.message);
  }

  // 2. DB search: find matches within title, description, or genres
  let dbResults = [];
  try {
    // Generate simple variations for genre matching
    const genreQueries = [
      query,
      query.toLowerCase(),
      query.toUpperCase(),
      query.charAt(0).toUpperCase() + query.slice(1).toLowerCase()
    ];
    const limit = 50;
    const skip = (page - 1) * limit;
    dbResults = await prisma.manga.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { genres: { hasSome: genreQueries } }
        ],
        isHidden: false
      },
      skip,
      take: limit
    });
  } catch (dbErr) {
    console.warn('[MangaService] DB search failed:', dbErr.message);
  }

  const mappedDb = dbResults.map(mapManga);

  // 3. Merge & deduplicate (prefer DB records as they are populated with chapters)
  const seenIds = new Set();
  const merged = [];
  
  for (const m of mappedDb) {
    if (!seenIds.has(m.id)) {
      merged.push(m);
      seenIds.add(m.id);
    }
  }
  
  for (const m of scraperResults) {
    if (!seenIds.has(m.id)) {
      merged.push(m);
      seenIds.add(m.id);
    }
  }

  return applyContentFilters(merged, userId, true); // Explicit search
}

async function getMangaInfo(mangaId, userId = null) {
  const cacheKey = `manga:${mangaId}`;

  // 1. Check in-memory/Redis cache first
  let manga = await cache.get(cacheKey);

  if (!manga) {
    let dbManga = null;
    try {
      // 2. Check local database — fetch info + stats in ONE query
      dbManga = await prisma.manga.findUnique({
        where: { id: mangaId },
        include: { ratings: true }
      });
    } catch (dbErr) {
      console.warn('[MangaService] DB connection failed when retrieving manga info. Bypassing database:', dbErr.message);
    }

    if (dbManga) {
      manga = mapManga(dbManga);

      // Attach local stats from the same query (no second round-trip!)
      manga.readCount = dbManga.readCount || 0;
      if (dbManga.ratings && dbManga.ratings.length > 0) {
        const total = dbManga.ratings.reduce((sum, r) => sum + r.score, 0);
        manga.averageRating = (total / dbManga.ratings.length).toFixed(1);
        if (userId) {
          const userR = dbManga.ratings.find(r => r.userId === userId);
          if (userR) manga.userRating = userR.score;
        }
      }

      // Calculate age of database records in hours
      const ageHours = (Date.now() - new Date(dbManga.updatedAt).getTime()) / 3600000;

      // If the data is fresh (< 24 hours), cache it and return
      if (ageHours < 24) {
        await cache.set(cacheKey, manga, cache.ttl.mangaTtl);
      } else {
        // Stale-While-Revalidate: Return DB data instantly, refresh in background
        console.log(`[MangaService] SWR Refreshing manga info: ${mangaId} (age: ${ageHours.toFixed(1)}h)`);
        refreshMangaInfoBackground(mangaId).catch(err => {
          console.error(`[MangaService] SWR Background refresh failed for ${mangaId}:`, err.message);
        });
      }
    } else {
      // 3. Cache miss & DB miss/error: perform real-time scrape
      try {
        manga = await refreshMangaInfoBackground(mangaId);
      } catch (scrapeErr) {
        console.warn(`[MangaService] DB/Scrape fallback chain triggered for info ${mangaId}. Retrying raw ingestion:`, scrapeErr.message);
        const { data } = await ingestion.getMangaInfo(mangaId);
        manga = mapManga(data);
      }
    }
  }

  // Force re-fetch if genres are empty (helps recover from failed scrapes)
  if (!manga || !manga.genres || manga.genres.length === 0) {
    try {
      const { data } = await ingestion.getMangaInfo(mangaId);
      const fresh = mapManga(data);
      if (fresh.genres && fresh.genres.length > 0) {
        if (!manga) manga = fresh;
        else manga.genres = fresh.genres;
        await cache.set(cacheKey, manga, cache.ttl.mangaTtl);
      }
    } catch (err) {}
  }

  // NSFW gate
  if (manga && manga.nsfw && userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { nsfw: true } });
      if (user && !user.nsfw) {
        throw Object.assign(new Error('NSFW content is disabled for your account'), { status: 403 });
      }
    } catch (err) {
      if (err.status === 403) throw err;
      console.warn('[MangaService] DB Check failed for user NSFW settings, allowing by default for guest or handling gracefully:', err.message);
    }
  }

  // If manga came from cache, attach fresh stats from DB
  if (manga && (!manga.readCount && manga.readCount !== 0)) {
    try {
      const dbMangaStats = await prisma.manga.findUnique({
        where: { id: mangaId },
        select: { readCount: true, ratings: true }
      });

      if (dbMangaStats) {
        manga.readCount = dbMangaStats.readCount || 0;
        if (dbMangaStats.ratings && dbMangaStats.ratings.length > 0) {
          const total = dbMangaStats.ratings.reduce((sum, r) => sum + r.score, 0);
          manga.averageRating = (total / dbMangaStats.ratings.length).toFixed(1);
          if (userId) {
            const userR = dbMangaStats.ratings.find(r => r.userId === userId);
            if (userR) manga.userRating = userR.score;
          }
        }
      }
    } catch (err) {
      // ignore db stats retrieval issues for returning scraped info
      manga.readCount = 0;
    }
  }

  return manga;
}

// Background worker helper to scrape and update manga info, chapters, and caches
async function refreshMangaInfoBackground(mangaId) {
  const cacheKey = `manga:${mangaId}`;
  const { data } = await ingestion.getMangaInfo(mangaId);
  const mapped = mapManga(data);

  const chaptersCacheKey = `chapters:${mangaId}`;
  const rawChapters = data.chapters || [];
  const mappedChapters = rawChapters.map((ch) => mapRawChapter(ch, mangaId));
  const normalizedChapters = normalize(mappedChapters, mangaId);

  let lastChapter = mapped.lastChapter || null;
  let lastChapterId = mapped.lastChapterId || null;
  if (normalizedChapters.length > 0) {
    const latest = normalizedChapters[normalizedChapters.length - 1];
    lastChapter = latest.title || `Chapter ${latest.number}`;
    lastChapterId = latest.id;
  }

  mapped.lastChapter = lastChapter;
  mapped.lastChapterId = lastChapterId;

  try {
    const dbData = {
      id: mapped.id,
      title: mapped.title,
      cover: mapped.cover,
      description: mapped.description,
      status: mapped.status,
      genres: mapped.genres,
      nsfw: mapped.nsfw,
      source: mapped.source,
      cachedAt: new Date(),
      lastChapter,
      lastChapterId
    };

    await prisma.manga.upsert({
      where: { id: mapped.id },
      update: dbData,
      create: dbData
    });
  } catch (dbErr) {
    console.warn('[MangaService] Failed to upsert scraped manga into local database:', dbErr.message);
  }
  
  await cache.set(chaptersCacheKey, normalizedChapters, cache.ttl.chaptersTtl);
  await cache.set(cacheKey, mapped, cache.ttl.mangaTtl);

  // Sync chapters to database in the background
  saveChaptersToDbBackground(mangaId, normalizedChapters).catch(() => {});

  return mapped;
}

async function saveChaptersToDbBackground(mangaId, chapters) {
  try {
    const existing = await prisma.chapter.findMany({
      where: { mangaId },
      select: { id: true }
    });
    const existingIds = new Set(existing.map(ch => ch.id));

    const newChapters = chapters
      .filter(ch => !existingIds.has(ch.id))
      .map(ch => ({
        id: ch.id,
        mangaId: mangaId,
        number: ch.number,
        title: ch.title,
        sources: ch.sources
      }));

    if (newChapters.length > 0) {
      await prisma.chapter.createMany({
        data: newChapters,
        skipDuplicates: true
      });
      console.log(`[MangaService] Bulk inserted ${newChapters.length} new chapters for ${mangaId}`);
    }
  } catch (err) {
    console.error(`[MangaService] Failed to save chapters for ${mangaId}:`, err.message);
  }
}

async function getChapters(mangaId, userId = null) {
  const cacheKey = `chapters:${mangaId}`;

  // 1. Check in-memory cache first
  let chapters = await cache.get(cacheKey);
  if (chapters) return chapters;

  // 2. Check local database
  let dbManga = null;
  try {
    dbManga = await prisma.manga.findUnique({
      where: { id: mangaId },
      include: { chapters: { orderBy: { number: 'desc' } } }
    });
  } catch (dbErr) {
    console.warn('[MangaService] DB connection failed when retrieving chapters. Bypassing database:', dbErr.message);
  }

  if (dbManga && dbManga.chapters && dbManga.chapters.length > 0) {
    chapters = dbManga.chapters.map(ch => ({
      id: ch.id,
      number: ch.number,
      title: ch.title,
      sources: ch.sources,
      mangaId: ch.mangaId
    }));

    const ageHours = (Date.now() - new Date(dbManga.updatedAt).getTime()) / 3600000;

    // If manga info was updated in the last 6 hours, cache the chapters list as fresh
    if (ageHours < 6) {
      await cache.set(cacheKey, chapters, cache.ttl.chaptersTtl);
    } else {
      // Stale-While-Revalidate: Return DB data instantly, and trigger refresh in background
      console.log(`[MangaService] SWR Refreshing chapters: ${mangaId} (age: ${ageHours.toFixed(1)}h)`);
      refreshMangaInfoBackground(mangaId).catch(err => {
        console.error(`[MangaService] SWR Background chapter sync failed for ${mangaId}:`, err.message);
      });
    }
    return chapters;
  }

  // 3. Cache miss & DB miss/error: perform real-time scrape
  try {
    await refreshMangaInfoBackground(mangaId);
    chapters = await cache.get(cacheKey);
  } catch (scrapeErr) {
    console.warn(`[MangaService] Scrape fallback triggered for chapters ${mangaId}:`, scrapeErr.message);
    try {
      const { data } = await ingestion.getMangaInfo(mangaId);
      const rawChapters = data.chapters || [];
      chapters = rawChapters.map((ch) => mapRawChapter(ch, mangaId));
    } catch (ingestErr) {
      console.error('[MangaService] Fatal: Chapters retrieval failed completely:', ingestErr.message);
      chapters = [];
    }
  }
  return chapters || [];
}

async function getChapterPages(chapterId, mangaId) {
  const cacheKey = `pages:${chapterId}`;

  return cache.getOrSet(cacheKey, 3600, async () => {
    const response = await ingestion.getChapterPages(chapterId);
    const { data, externalUrl } = response;

    // Consumet returns array of { img } or { page, img } objects
    const pages = Array.isArray(data)
      ? data.map((p) => imageShield(p.img || p.page || p))
      : (data.images || data.pages || []).map(p => imageShield(p));

    return { pages, externalUrl: externalUrl || null };
  });
}

async function getPopular(page = 1, userId = null, genre = null) {
  const cacheKey = `popular_v2:${page}:${genre || 'all'}`;
  const results = await cache.getOrSet(cacheKey, cache.ttl.searchTtl, async () => {
    if (page === 1 && genre) {
      try {
        const { getPopularMangaByGenre } = require('./anilistService');
        const anilistManga = await getPopularMangaByGenre(genre, 10);
        
        if (anilistManga && anilistManga.length > 0) {
          const matchedResults = [];
          let ingestedCount = 0;
          
          for (const item of anilistManga) {
            let matchedManga = null;
            
            // 1. DB Lookup (Case-Insensitive)
            for (const t of item.titles) {
              const dbManga = await prisma.manga.findFirst({
                where: {
                  title: {
                    equals: t,
                    mode: 'insensitive'
                  }
                }
              });
              if (dbManga) {
                matchedManga = mapManga(dbManga);
                break;
              }
            }

            // 2. Search & Ingest on MangaKatana (max 2 per request to prevent rate limits)
            if (!matchedManga && ingestedCount < 2) {
              try {
                if (ingestedCount > 0) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }

                const searchRes = await ingestion.searchManga(item.titles[0]);
                const searchList = searchRes?.data?.results || searchRes?.results || [];
                
                if (searchList.length > 0) {
                  const cleanCandidateTitles = item.titles.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  const bestMatch = searchList.find(s => {
                    const cleanS = s.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return cleanCandidateTitles.some(c => cleanS === c || cleanS.includes(c) || c.includes(cleanS));
                  });

                  if (bestMatch) {
                    const fullInfo = await getMangaInfo(bestMatch.id);
                    if (fullInfo) {
                      matchedManga = fullInfo;
                      ingestedCount++;
                    }
                  }
                }
              } catch (searchErr) {
                console.warn(`[MangaService] Failed to resolve AniList title "${item.titles[0]}" on MangaKatana:`, searchErr.message);
              }
            }

            if (matchedManga) {
              matchedResults.push(matchedManga);
            }
          }

          if (matchedResults.length > 0) {
            if (matchedResults.length < 18) {
              try {
                const { data: scraperData } = await ingestion.getPopular(page, genre);
                const scraperResults = (scraperData.results || []).map(mapManga);
                const matchedIds = new Set(matchedResults.map(m => m.id));
                for (const m of scraperResults) {
                  if (!matchedIds.has(m.id)) {
                    matchedResults.push(m);
                    matchedIds.add(m.id);
                    if (matchedResults.length >= 18) break;
                  }
                }
              } catch (backfillErr) {
                console.warn('[MangaService] AniList popular backfill failed:', backfillErr.message);
              }
            }
            return matchedResults;
          }
        }
      } catch (err) {
        console.warn(`[MangaService] AniList popular retrieval failed for ${genre}, falling back:`, err.message);
      }
    }

    const { data } = await ingestion.getPopular(page, genre);
    let mapped = (data.results || []).map(mapManga);

    // ⚡ Enhancement: If genres are missing (common on homepage), try to recover from DB
    const missingGenres = mapped.filter(m => !m.genres || m.genres.length === 0);
    if (missingGenres.length > 0) {
      try {
        const dbManga = await prisma.manga.findMany({
          where: { id: { in: missingGenres.map(m => m.id) } },
          select: { id: true, genres: true }
        });
        const genreMap = new Map(dbManga.map(m => [m.id, m.genres]));
        mapped.forEach(m => {
          if ((!m.genres || m.genres.length === 0) && genreMap.has(m.id)) {
            m.genres = genreMap.get(m.id);
          }
        });
      } catch (dbErr) {
        console.warn('[MangaService] DB Connection failed during genre recovery, skipping database metadata enrichment:', dbErr.message);
      }
    }

    // ⚡ Genre filter: when a genre is specified, keep only manga that include it
    if (genre) {
      const lower = genre.toLowerCase();
      mapped = mapped.filter(m => m.genres && m.genres.some(g => {
        const name = typeof g === 'string' ? g : (g.name || g.title || '');
        return name.toLowerCase() === lower;
      }));
    }

    return mapped;
  });

  // ⚡ Trending Injection: If fetching page 1 of a genre, inject trending manga that match this genre
  if (page === 1 && genre) {
    try {
      const trendingCacheKey = `popular_v2:1:all`;
      const trending = await cache.get(trendingCacheKey);
      if (trending && Array.isArray(trending)) {
        const matchingTrending = trending.filter(m => 
          m.genres.some(g => g.toLowerCase() === genre.toLowerCase())
        );
        
        // Merge and remove duplicates
        const existingIds = new Set(results.map(m => m.id));
        const injected = matchingTrending.filter(m => !existingIds.has(m.id));
        
        if (injected.length > 0) {
          return applyContentFilters([...injected, ...results], userId, false);
        }
      }
    } catch (err) {
      console.warn('[MangaService] Trending injection failed:', err.message);
    }
  }

  // ⚡ Fallback: If a genre was requested but we got no results, try a broader browse include filter
  if (genre && (!results || results.length === 0)) {
    try {
      const fallbackData = await ingestion.browseManga({ include: [genre], page });
      const fallbackMapped = (fallbackData.data.results || []).map(mapManga);
      return applyContentFilters(fallbackMapped, userId, false);
    } catch (err) {
      console.warn('[MangaService] Genre fallback failed:', err.message);
    }
  }

  return applyContentFilters(results, userId, false);
}

async function getRecent(page = 1, userId = null) {
  const cacheKey = `recent:${page}`;
  const results = await cache.getOrSet(cacheKey, cache.ttl.searchTtl, async () => {
    let list = [];
    let currentPage = page;
    let attempts = 0;

    if (page === 1) {
      try {
        const { getTrendingManga } = require('./anilistService');
        const anilistManga = await getTrendingManga(20);
        
        if (anilistManga && anilistManga.length > 0) {
          const matchedResults = [];
          let ingestedCount = 0;
          
          for (const item of anilistManga) {
            let matchedManga = null;
            
            // 1. DB Lookup (Case-Insensitive)
            for (const t of item.titles) {
              const dbManga = await prisma.manga.findFirst({
                where: {
                  title: {
                    equals: t,
                    mode: 'insensitive'
                  }
                }
              });
              if (dbManga) {
                matchedManga = mapManga(dbManga);
                break;
              }
            }

            // 2. Search & Ingest on MangaKatana (max 2 per request to prevent rate limits)
            if (!matchedManga && ingestedCount < 2) {
              try {
                if (ingestedCount > 0) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }

                const searchRes = await ingestion.searchManga(item.titles[0]);
                const searchList = searchRes?.data?.results || searchRes?.results || [];
                
                if (searchList.length > 0) {
                  const cleanCandidateTitles = item.titles.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  const bestMatch = searchList.find(s => {
                    const cleanS = s.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return cleanCandidateTitles.some(c => cleanS === c || cleanS.includes(c) || c.includes(cleanS));
                  });

                  if (bestMatch) {
                    const fullInfo = await getMangaInfo(bestMatch.id);
                    if (fullInfo) {
                      matchedManga = fullInfo;
                      ingestedCount++;
                    }
                  }
                }
              } catch (searchErr) {
                console.warn(`[MangaService] Failed to resolve AniList trending title "${item.titles[0]}" on MangaKatana:`, searchErr.message);
              }
            }

            if (matchedManga) {
              matchedResults.push(matchedManga);
            }
          }
          list = matchedResults;
        }
      } catch (err) {
        console.warn('[MangaService] AniList trending flow failed:', err.message);
      }
    }

    const seenIds = new Set(list.map(m => m.id));
    while (list.length < 30 && attempts < 5) {
      try {
        const { data } = await ingestion.getRecent(currentPage);
        const scraperResults = (data.results || []).map(mapManga);
        if (scraperResults.length === 0) break;

        for (const m of scraperResults) {
          if (!seenIds.has(m.id)) {
            list.push(m);
            seenIds.add(m.id);
          }
        }
      } catch (err) {
        console.warn('[MangaService] Ingestion getRecent failed:', err.message);
        break;
      }
      currentPage++;
      attempts++;
    }

    return list;
  });
  return applyContentFilters(results, userId, false);
}

async function getPopularByScore(limit = 20, userId = null) {
  try {
    // 1. Fetch from popularity table directly
    const popularRecords = await prisma.popularity.findMany({
      where: {
        manga: { isHidden: false },
        score: { gt: 0 }
      },
      include: { manga: true },
      orderBy: { score: 'desc' },
      take: limit,
    });

    const results = popularRecords.map(p => ({
      ...p.manga,
      popularity: p
    }));

    const mapped = results.map(mapManga);
    return applyContentFilters(mapped, userId, false);
  } catch (err) {
    console.error('[MangaService] getPopularByScore failed:', err);
    throw err;
  }
}

async function browse(filters = {}, userId = null) {
  // ⚡ Bypass cache for keyword searches to ensure we hit all providers fresh
  const useCache = !filters.keyword;
  const cacheKey = `browse:${JSON.stringify(filters)}`;
  
  if (useCache) {
    const cached = await cache.get(cacheKey);
    if (cached) return applyContentFiltersToBrowseResult(cached, userId);
  }

  const targetCount = 27;

  // AniList integration for Popular genre lists (order = 5)
  if (filters.order === 5 && filters.include && filters.include.length > 0 && !filters.keyword) {
    try {
      const genreSlug = filters.include[0];
      const genre = genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1);
      const currentPage = filters.page || 1;
      
      const { getPopularMangaByGenre } = require('./anilistService');
      // Fetch up to 50 popular manga for this page to ensure we have enough safe candidates
      const anilistManga = await getPopularMangaByGenre(genre, 50, currentPage);
      
      const BLACKLIST_SLUGS = [
        '18+', 'adult', 'smut', 'erotica', 'sexual-violence', 'sexual violence', 'harem', 'yaoi', 'yuri',
        'incest', 'gore', 'mature', 'ecchi', 'hentai', 'pornographic', 'loli', 'shota'
      ];
      const isExplicit = filters.include.some(tag => 
        BLACKLIST_SLUGS.includes(tag.toLowerCase()) || 
        BLACKLIST_SLUGS.includes(tag.toLowerCase().replace(/\s+/g, '-'))
      );
      
      if (anilistManga && anilistManga.length > 0) {
        const matchedResults = [];
        let ingestedCount = 0;
        
        for (const item of anilistManga) {
          // Pre-filter NSFW/restricted titles if this is not an explicit adult search
          if (!isExplicit) {
            const hasRestrictedGenre = item.genres.some(g => BLACKLIST_SLUGS.includes(g.toLowerCase()));
            if (hasRestrictedGenre) continue;
          }

          let matchedManga = null;
          
          // 1. DB Lookup (Case-Insensitive)
          for (const t of item.titles) {
            const dbManga = await prisma.manga.findFirst({
              where: {
                title: {
                  equals: t,
                  mode: 'insensitive'
                }
              }
            });
            if (dbManga) {
              matchedManga = mapManga(dbManga);
              break;
            }
          }

          // 2. Search & Ingest on MangaKatana (max 2 per request to prevent rate limits)
          if (!matchedManga && ingestedCount < 2 && matchedResults.length < 27) {
            try {
              if (ingestedCount > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }

              const searchRes = await ingestion.searchManga(item.titles[0]);
              const searchList = searchRes?.data?.results || searchRes?.results || [];
              
              if (searchList.length > 0) {
                const cleanCandidateTitles = item.titles.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ''));
                const bestMatch = searchList.find(s => {
                  const cleanS = s.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                  return cleanCandidateTitles.some(c => cleanS === c || cleanS.includes(c) || c.includes(cleanS));
                });

                if (bestMatch) {
                  const fullInfo = await getMangaInfo(bestMatch.id);
                  if (fullInfo) {
                    matchedManga = fullInfo;
                    ingestedCount++;
                  }
                }
              }
            } catch (searchErr) {
              console.warn(`[MangaService] Browse resolution failed for AniList title "${item.titles[0]}":`, searchErr.message);
            }
          }

          if (matchedManga) {
            matchedResults.push(matchedManga);
            if (matchedResults.length >= 27 && ingestedCount >= 2) {
              break; // Met targets, stop resolution early
            }
          }
        }

        let filtered = await applyContentFilters(matchedResults, userId, isExplicit);

        if (filtered.length < 27) {
          try {
            // Dynamic backfill from the scraper over multiple pages if necessary
            let scraperPage = currentPage;
            let scraperAttempts = 0;
            const matchedIds = new Set(filtered.map(m => m.id));

            while (filtered.length < 27 && scraperAttempts < 5) {
              const scraperData = await ingestion.browseManga({ ...filters, page: scraperPage });
              const scraperResults = (scraperData.data?.results || scraperData.results || []).map(mapManga);
              if (scraperResults.length === 0) break;

              const cleanScraper = await applyContentFilters(scraperResults, userId, isExplicit);
              for (const m of cleanScraper) {
                if (!matchedIds.has(m.id)) {
                  filtered.push(m);
                  matchedIds.add(m.id);
                  if (filtered.length >= 27) break;
                }
              }
              scraperPage++;
              scraperAttempts++;
            }
          } catch (backfillErr) {
            console.warn('[MangaService] Browse AniList backfill failed:', backfillErr.message);
          }
        }

        const finalData = {
          results: filtered.slice(0, 27),
          currentPage,
          totalResults: 500 * 27, // Assume 500 pages of 27
          totalPages: 500
        };

        if (useCache) {
          await cache.set(cacheKey, finalData, cache.ttl.searchTtl);
        }
        return finalData;
      }
    } catch (err) {
      console.warn(`[MangaService] Browse AniList popular genre list retrieval failed, falling back:`, err.message);
    }
  }

  let results = [];
  let totalData = {};
  let currentPage = filters.page || 1;
  let attempts = 0;

  const BLACKLIST_SLUGS = [
    '18+', 'adult', 'smut', 'erotica', 'sexual-violence', 'sexual violence', 'harem', 'yaoi', 'yuri',
    'incest', 'gore', 'mature', 'ecchi', 'hentai', 'pornographic', 'loli', 'shota'
  ];
  const isExplicit = !!filters.keyword || (filters.include && filters.include.some(tag => 
    BLACKLIST_SLUGS.includes(tag.toLowerCase()) || 
    BLACKLIST_SLUGS.includes(tag.toLowerCase().replace(/\s+/g, '-'))
  ));

  // Fill strategy: keep fetching until we have targetCount safe results
  while (results.length < targetCount && attempts < 10) {
    const res = await ingestion.browseManga({ ...filters, page: currentPage });
    if (!res.data.results || res.data.results.length === 0) break;
    
    if (!totalData.totalResults) {
      totalData = res.data;
    }

    const mapped = (res.data.results || []).map(mapManga);
    const filtered = await applyContentFilters(mapped, userId, isExplicit);
    
    results = [...results, ...filtered];
    if (results.length >= targetCount) break;
    
    currentPage++;
  }

  // ⚡ Local DB search fallback if scraper returned nothing (e.g. single-character query like "t")
  if (results.length === 0 && filters.keyword) {
    try {
      const keyword = filters.keyword.trim();
      const genreQueries = [
        keyword,
        keyword.toLowerCase(),
        keyword.toUpperCase(),
        keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase()
      ];
      const dbCount = await prisma.manga.count({
        where: {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
            { genres: { hasSome: genreQueries } }
          ],
          isHidden: false
        }
      });
      const skip = ((filters.page || 1) - 1) * targetCount;
      const dbResults = await prisma.manga.findMany({
        where: {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
            { genres: { hasSome: genreQueries } }
          ],
          isHidden: false
        },
        skip,
        take: targetCount
      });
      const mapped = dbResults.map(mapManga);
      results = await applyContentFilters(mapped, userId, isExplicit);
      totalData.totalResults = dbCount;
      totalData.totalPages = Math.ceil(dbCount / targetCount) || 1;
    } catch (dbErr) {
      console.warn('[MangaService] Browse DB fallback failed:', dbErr.message);
    }
  }

  const totalResults = totalData.totalResults || results.length;
  const totalPages = totalData.totalPages || Math.ceil(totalResults / targetCount) || 1;

  const finalData = {
    ...totalData,
    results: results.slice(0, targetCount),
    currentPage: filters.page || 1,
    totalResults,
    totalPages
  };

  if (useCache) {
    await cache.set(cacheKey, finalData, cache.ttl.searchTtl);
  }

  return finalData;
}

async function rateManga(userId, mangaId, score) {
  // Ensure manga exists in DB first
  try {
    const existing = await prisma.manga.findUnique({ where: { id: mangaId } });
    if (!existing) {
      await getMangaInfo(mangaId); // will create it
    }

    const rating = await prisma.rating.upsert({
      where: { userId_mangaId: { userId, mangaId } },
      update: { score },
      create: { userId, mangaId, score },
    });

    return rating;
  } catch (err) {
    console.error(`[MangaService] Failed to rate manga ${mangaId}:`, err.message);
    throw err;
  }
}

async function getRelated(mangaId, userId = null) {
  const manga = await getMangaInfo(mangaId, userId);
  if (!manga.genres || manga.genres.length === 0) return [];

  // Find other manga in DB with similar genres
  // This creates internal linking clusters that search engines love
  const related = await prisma.manga.findMany({
    where: {
      id: { not: mangaId },
      isHidden: false,
      nsfw: userId ? undefined : false, // Strictly hide NSFW from guests at DB level
      genres: { hasSome: manga.genres }
    },
    take: 12,
    orderBy: { readCount: 'desc' }
  });

  const mapped = related.map(mapManga);
  return applyContentFilters(mapped, userId, false); // Not an explicit search
}

async function trackSearch(keyword) {
  if (!keyword) return;
  prisma.searchKeyword.upsert({
    where: { keyword: keyword.toLowerCase() },
    update: { count: { increment: 1 } },
    create: { keyword: keyword.toLowerCase(), count: 1 }
  }).catch(() => { });
}

module.exports = { search, getMangaInfo, getChapters, getChapterPages, getPopular, getRecent, getPopularByScore, browse, rateManga, getRelated, trackSearch };
