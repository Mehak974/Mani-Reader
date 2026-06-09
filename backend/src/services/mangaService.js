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
  if (!url || !config.imageProxyUrl || url.includes(config.imageProxyUrl)) return url;
  return `${config.imageProxyUrl}?url=${encodeURIComponent(url)}`;
}

async function applyContentFilters(results, userId = null, isExplicitSearch = false) {
  if (!results || results.length === 0) return [];

  // 1. Fetch Global Settings
  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: ['globalNsfw'] } }
  });
  const globalNsfw = settings.find(s => s.key === 'globalNsfw')?.value === 'true';

  // 2. Filter out hidden manga from local DB
  const hiddenIds = await prisma.manga.findMany({
    where: { id: { in: results.map(r => r.id) }, isHidden: true },
    select: { id: true }
  });
  const hiddenSet = new Set(hiddenIds.map(h => h.id));
  let filtered = results.filter(m => !hiddenSet.has(m.id));

  // 3. Apply NSFW filters
  // ⚡ Rule: If it's an explicit search, we allow everything. 
  // Otherwise, we filter based on user settings or guest status.
  if (!isExplicitSearch) {
    if (globalNsfw) {
      filtered = filtered.filter(m => !m.nsfw);
    } else if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { nsfw: true } });
      if (user && !user.nsfw) {
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
    nsfw: !!(
      raw.isAdult || 
      raw.nsfw || 
      (Array.isArray(raw.genres) && raw.genres.some(g => {
        const gl = (typeof g === 'string' ? g : '').toLowerCase();
        return ['hentai', 'ecchi', 'smut', 'adult', '18+', 'harem', 'yaoi', 'yuri',
          'loli', 'shota', 'erotica', 'pornographic', 'sexual-violence'].some(bad => gl === bad);
      }))
    ),
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
  // ⚡ Bypass cache for explicit searches to ensure fresh multi-source results
  const { data } = await ingestion.searchManga(query, page);
  const results = data.results || data || [];
  
  return applyContentFilters(results, userId, true); // Explicit search
}

async function getMangaInfo(mangaId, userId = null) {
  const cacheKey = `manga:${mangaId}`;

  const manga = await cache.getOrSet(cacheKey, cache.ttl.mangaTtl, async () => {
    const { data } = await ingestion.getMangaInfo(mangaId);
    if (!data) {
      throw Object.assign(new Error(`Manga details not found: ${mangaId}`), { status: 404 });
    }
    const mapped = mapManga(data);

    // Upsert into DB only when fetching fresh data
    const dbData = {
      id: mapped.id,
      title: mapped.title,
      cover: mapped.cover,
      description: mapped.description,
      status: mapped.status,
      genres: mapped.genres,
      nsfw: mapped.nsfw,
      source: mapped.source
    };

    await prisma.manga.upsert({
      where: { id: mapped.id },
      update: dbData,
      create: dbData
    });

    // ⚡ Optimization: Cache chapters while we have them
    const chaptersCacheKey = `chapters:${mangaId}`;
    const rawChapters = data.chapters || [];
    const mappedChapters = rawChapters.map((ch) => mapRawChapter(ch, mangaId));
    const normalizedChapters = normalize(mappedChapters, mangaId);
    await cache.set(chaptersCacheKey, normalizedChapters, cache.ttl.chaptersTtl);

    return mapped;
  });

  // Force re-fetch if genres are empty (helps recover from failed scrapes)
  if (!manga.genres || manga.genres.length === 0) {
    const { data } = await ingestion.getMangaInfo(mangaId);
    const fresh = mapManga(data);
    if (fresh.genres && fresh.genres.length > 0) {
      manga.genres = fresh.genres;
      await cache.set(cacheKey, manga, cache.ttl.mangaTtl);
    }
  }

  // NSFW gate
  if (manga.nsfw && userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { nsfw: true } });
    if (user && !user.nsfw) {
      throw Object.assign(new Error('NSFW content is disabled for your account'), { status: 403 });
    }
  }

  // 3. Fetch real-time local data (ReadCount, Ratings)
  const dbManga = await prisma.manga.findUnique({
    where: { id: mangaId },
    select: {
      readCount: true,
      ratings: true
    }
  });

  if (dbManga) {
    manga.readCount = dbManga.readCount || 0;
    if (dbManga.ratings && dbManga.ratings.length > 0) {
      const total = dbManga.ratings.reduce((sum, r) => sum + r.score, 0);
      manga.averageRating = (total / dbManga.ratings.length).toFixed(1);

      if (userId) {
        const userR = dbManga.ratings.find(r => r.userId === userId);
        if (userR) manga.userRating = userR.score;
      }
    }
  }

  return manga;
}

async function getChapters(mangaId, userId = null) {
  const cacheKey = `chapters:${mangaId}`;

  return await cache.getOrSet(cacheKey, cache.ttl.chaptersTtl, async () => {
    // ⚡ Optimization: Fetch info (which includes chapters) and cache it too
    const { data } = await ingestion.getMangaInfo(mangaId);
    const rawChapters = data.chapters || [];
    const mapped = rawChapters.map((ch) => mapRawChapter(ch, mangaId));
    const normalizedList = normalize(mapped, mangaId);

    // Save info cache while we are at it
    const infoCacheKey = `manga:${mangaId}`;
    const mappedInfo = mapManga(data);
    await cache.set(infoCacheKey, mappedInfo, cache.ttl.mangaTtl);

    // Upsert chapters into DB
    for (const ch of normalizedList) {
      prisma.chapter.upsert({
        where: { id: ch.id },
        update: { title: ch.title, sources: ch.sources },
        create: { id: ch.id, mangaId, number: ch.number, title: ch.title, sources: ch.sources },
      }).catch(() => {});
    }

    return normalizedList;
  });
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
    const { data } = await ingestion.getPopular(page, genre);
    let mapped = (data.results || []).map(mapManga);

    // ⚡ Enhancement: If genres are missing (common on homepage), try to recover from DB
    const missingGenres = mapped.filter(m => !m.genres || m.genres.length === 0);
    if (missingGenres.length > 0) {
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
    const { data } = await ingestion.getRecent(page);
    return (data.results || []).map(mapManga);
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

  const targetCount = 20;
  let results = [];
  let totalData = {};
  let currentPage = filters.page || 1;
  let attempts = 0;

  // Fill strategy: keep fetching until we have targetCount safe results
  while (results.length < targetCount && attempts < 10) {
    const res = await ingestion.browseManga({ ...filters, page: currentPage });
    if (!res.data.results || res.data.results.length === 0) break;
    
    if (!totalData.totalResults) {
      totalData = res.data;
    }

    // For keywords or specific genre inclusions, use explicit mode; for general browse, use safe guest filtering
    const isExplicit = !!filters.keyword || (filters.include && filters.include.length > 0);
    const filtered = await applyContentFilters(res.data.results, userId, isExplicit);
    
    results = [...results, ...filtered];
    if (results.length >= targetCount) break;
    
    currentPage++;
    attempts++;
  }

  const totalResults = totalData.totalResults || results.length;
  const totalPages = totalData.totalPages || Math.ceil(totalResults / 20) || 1;

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
