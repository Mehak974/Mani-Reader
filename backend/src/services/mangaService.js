'use strict';
const prisma = require('../lib/prisma');
const ingestion = require('./ingestionLayer');
const cache = require('./cacheLayer');

function mapManga(raw) {
  return {
    id: raw.id,
    title: raw.title || 'Unknown Title',
    cover: raw.cover || raw.image || null,
    description: raw.description || null,
    status: raw.status || null,
    genres: Array.isArray(raw.genres) ? raw.genres : [],
    nsfw: !!raw.nsfw,
    rating: raw.rating || null,
    lastChapter: raw.lastChapter || null,
    lastChapterId: raw.lastChapterId || null,
    latestChapters: raw.latestChapters || [],
    updateDate: raw.updateDate || null,
    source: raw.source || 'local',
    popularity: raw.popularity || null,
    readCount: raw.readCount || 0,
    averageRating: raw.averageRating || null,
    userRating: raw.userRating || null,
  };
}

const STRICT_BLACKLIST_TAGS = [
  '18+', 'smut', 'erotica', 'sexual-violence', 'sexual violence', 'yaoi', 'yuri',
  'incest', 'ecchi', 'hentai', 'pornographic', 'loli', 'shota'
];
const BORDERLINE_TAGS = ['harem', 'mature', 'josei', 'gore'];
const BLACKLIST_KEYWORDS = ['sexy', 'sex', 'thot', 'nude', 'porn', 'hentai', 'uncensored', 'sexual', 'unfiltered', 'erotic', 'smut', 'harem', 'ero', 'submission', 'submits'];

function checkIsNSFW(genres = [], isAdult = false, isNsfwFlag = false) {
  const genreList = genres.map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase().trim());
  const hasStrictBlacklist = genreList.some(tag =>
    STRICT_BLACKLIST_TAGS.some(bad => tag === bad || tag.includes(bad))
  );
  if (hasStrictBlacklist || isAdult || isNsfwFlag) return true;
  const borderlineCount = genreList.filter(tag =>
    BORDERLINE_TAGS.some(border => tag === border || tag.includes(border))
  ).length;
  return borderlineCount > 1;
}

function filterNSFW(mangaList, bypass = false) {
  if (!Array.isArray(mangaList)) return [];
  if (bypass) return mangaList;
  return mangaList.filter(m => {
    const genres = m.genres || [];
    const isNsfw = m.nsfw || checkIsNSFW(genres, m.isAdult, m.nsfw);
    if (isNsfw) return false;
    const title = (m.title || '').toLowerCase();
    const desc = (m.description || '').toLowerCase();
    const hasBadTitle = BLACKLIST_KEYWORDS.some(word => title.includes(word));
    const hasBadDesc = BLACKLIST_KEYWORDS.some(word => desc.includes(word));
    return !hasBadTitle && !hasBadDesc;
  });
}

let _cachedGlobalNsfw = { value: false, expiresAt: 0 };

async function applyContentFilters(results, userId = null, isExplicitSearch = false) {
  if (!results || results.length === 0) return [];
  let globalNsfw = _cachedGlobalNsfw.value;
  let hiddenSet = new Set();
  try {
    if (Date.now() > _cachedGlobalNsfw.expiresAt) {
      const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ['globalNsfw'] } }
      });
      globalNsfw = settings.find(s => s.key === 'globalNsfw')?.value === 'true';
      _cachedGlobalNsfw = { value: globalNsfw, expiresAt: Date.now() + 30000 };
    }
    const hiddenIds = await prisma.manga.findMany({
      where: { id: { in: results.map(r => r.id) }, isHidden: true },
      select: { id: true }
    });
    hiddenSet = new Set(hiddenIds.map(h => h.id));
  } catch (dbErr) {
    console.warn('[MangaService] DB Connection failed during content filtering, falling back to safe defaults:', dbErr.message);
    globalNsfw = true;
  }
  let filtered = results.filter(m => m && m.title && m.title !== 'Unknown Title' && m.title !== m.id && !hiddenSet.has(m.id));
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
        console.warn('[MangaService] DB Check failed for user NSFW settings, hiding NSFW by default:', err.message);
        filtered = filtered.filter(m => !m.nsfw);
      }
    } else {
      filtered = filtered.filter(m => !m.nsfw);
    }
  }
  if (!isExplicitSearch) {
    filtered = filtered.filter(m => {
      const title = (m.title || '').toLowerCase();
      const desc = (m.description || '').toLowerCase();
      return !BLACKLIST_KEYWORDS.some(word => title.includes(word) || desc.includes(word));
    });
  }
  return filtered;
}

async function applyContentFiltersToBrowseResult(data, userId, isExplicit = false) {
  if (!data || !data.results) return data;
  const filtered = await applyContentFilters(data.results, userId, isExplicit);
  return { ...data, results: filtered };
}

async function search(query, page = 1, userId = null) {
  const limit = 50;
  const skip = (page - 1) * limit;
  let dbResults = [];
  try {
    const genreQueries = [
      query,
      query.toLowerCase(),
      query.toUpperCase(),
      query.charAt(0).toUpperCase() + query.slice(1).toLowerCase()
    ];
    dbResults = await prisma.manga.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { genres: { hasSome: genreQueries } }
        ],
        isHidden: false,
        NOT: { id: { startsWith: 'atsumoe:' } }
      },
      skip,
      take: limit
    });
  } catch (dbErr) {
    console.warn('[MangaService] DB search failed:', dbErr.message);
  }
  const mapped = dbResults.map(mapManga);

  if (mapped.length === 0) {
    try {
      const { data } = await ingestion.searchManga(query, page);
      const scraperMapped = (data.results || []).map(mapManga);
      return applyContentFilters(scraperMapped, userId, true);
    } catch (err) {
      console.warn('[MangaService] Scraper search fallback failed:', err.message);
    }
  }

  return applyContentFilters(mapped, userId, true);
}

async function resolveMangaIdByTitle(title) {
  try {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const dbMatches = await prisma.manga.findMany({
      where: {
        title: { contains: title, mode: 'insensitive' },
        NOT: { id: { startsWith: 'atsumoe:' } }
      }
    });
    if (dbMatches.length > 0) {
      const bestDbMatch = dbMatches.find(m => m.title.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTitle)
        || dbMatches[0];
      return bestDbMatch.id;
    }
  } catch (err) {
    console.error(`[MangaService] Failed to resolve manga title "${title}":`, err.message);
  }
  return null;
}

async function getMangaInfo(mangaId, userId = null) {
  if (mangaId && mangaId.startsWith('atsumoe:')) {
    try {
      const dbManga = await prisma.manga.findUnique({ where: { id: mangaId } });
      if (dbManga && dbManga.title) {
        const resolvedId = await resolveMangaIdByTitle(dbManga.title);
        if (resolvedId) {
          return getMangaInfo(resolvedId, userId);
        }
      }
    } catch (err) {
      console.warn(`[MangaService] Error resolving atsumoe ID ${mangaId}:`, err.message);
    }
  }

  const cacheKey = `manga:${mangaId}`;
  let manga = await cache.get(cacheKey);
  if (!manga) {
    let dbManga = null;
    try {
      dbManga = await prisma.manga.findUnique({
        where: { id: mangaId },
        include: { ratings: true }
      });
    } catch (dbErr) {
      console.warn('[MangaService] DB connection failed when retrieving manga info:', dbErr.message);
    }
    if (dbManga) {
      manga = mapManga(dbManga);
      manga.readCount = dbManga.readCount || 0;
      if (dbManga.ratings && dbManga.ratings.length > 0) {
        const total = dbManga.ratings.reduce((sum, r) => sum + r.score, 0);
        manga.averageRating = (total / dbManga.ratings.length).toFixed(1);
        if (userId) {
          const userR = dbManga.ratings.find(r => r.userId === userId);
          if (userR) manga.userRating = userR.score;
        }
      }
      await cache.set(cacheKey, manga, cache.ttl.mangaTtl);
    } else {
      try {
        const { data } = await ingestion.getMangaInfo(mangaId);
        manga = mapManga(data);
        await cache.set(cacheKey, manga, cache.ttl.mangaTtl);
      } catch (scrapeErr) {
        console.warn(`[MangaService] Scrape fallback failed for info ${mangaId}:`, scrapeErr.message);
        return null;
      }
    }
  } else {
    if ((!manga.readCount && manga.readCount !== 0)) {
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
        manga.readCount = 0;
      }
    }
  }

  if (manga && !manga.nsfw && manga.genres && manga.genres.length > 0) {
    const genreList = manga.genres.map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase().trim());
    const hasStrictBlacklist = genreList.some(tag =>
      STRICT_BLACKLIST_TAGS.some(bad => tag === bad || tag.includes(bad))
    );
    if (hasStrictBlacklist) {
      manga.nsfw = true;
    }
  }

  if (manga && manga.nsfw && userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { nsfw: true } });
      if (user && !user.nsfw) {
        throw Object.assign(new Error('NSFW content is disabled for your account'), { status: 403 });
      }
    } catch (err) {
      if (err.status === 403) throw err;
      console.warn('[MangaService] DB Check failed for user NSFW settings, allowing by default:', err.message);
    }
  }

  return manga;
}

async function getChapters(mangaId, userId = null) {
  if (mangaId && mangaId.startsWith('atsumoe:')) {
    try {
      const dbManga = await prisma.manga.findUnique({ where: { id: mangaId } });
      if (dbManga && dbManga.title) {
        const resolvedId = await resolveMangaIdByTitle(dbManga.title);
        if (resolvedId) {
          return getChapters(resolvedId, userId);
        }
      }
    } catch (err) {
      console.warn(`[MangaService] Error resolving chapters atsumoe ID ${mangaId}:`, err.message);
    }
  }

  const cacheKey = `chapters:${mangaId}`;
  let chapters = await cache.get(cacheKey);
  if (chapters) return chapters;

  let dbManga = null;
  try {
    dbManga = await prisma.manga.findUnique({
      where: { id: mangaId },
      include: { chapters: { orderBy: { number: 'desc' } } }
    });
  } catch (dbErr) {
    console.warn('[MangaService] DB connection failed when retrieving chapters:', dbErr.message);
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
    if (ageHours < 6) {
      await cache.set(cacheKey, chapters, cache.ttl.chaptersTtl);
    }
    return chapters;
  }

  try {
    const { data } = await ingestion.getMangaInfo(mangaId);
    const rawChapters = data.chapters || [];
    const mappedChapters = rawChapters.map(ch => ({
      id: ch.id || ch.href,
      number: ch.chapterNumber || parseFloat((ch.title || '').match(/(\d+(\.\d+)?)/)?.[1] || '0'),
      title: ch.title || null,
      sources: [data.source || 'manganato'],
      mangaId,
    })).filter(ch => ch.id && !isNaN(ch.number));
    mappedChapters.sort((a, b) => a.number - b.number);
    await cache.set(cacheKey, mappedChapters, cache.ttl.chaptersTtl);
    return mappedChapters;
  } catch (scrapeErr) {
    console.warn(`[MangaService] Scrape fallback failed for chapters ${mangaId}:`, scrapeErr.message);
    return [];
  }
}

async function getChapterPages(chapterId, mangaId) {
  const cacheKey = `pages:${chapterId}`;
  return cache.getOrSet(cacheKey, 3600, async () => {
    const response = await ingestion.getChapterPages(chapterId);
    const { data } = response;
    const pages = Array.isArray(data.pages) ? data.pages : [];
    const proxied = pages.map(url => `/api/image?url=${encodeURIComponent(url)}`);
    return { pages: proxied, externalUrl: null };
  });
}

async function getPopular(page = 1, userId = null, genre = null) {
  const cacheKey = `popular:${page}:${genre || 'all'}`;
  const cached = await cache.get(cacheKey);
  if (cached) return applyContentFilters(cached, userId, false);

  try {
    const { data } = await ingestion.getPopular(page, genre);
    const results = (data.results || []).map(mapManga);
    const filtered = await applyContentFilters(results, userId, false);
    await cache.set(cacheKey, filtered, cache.ttl.searchTtl);
    return filtered;
  } catch (err) {
    console.warn('[MangaService] Popular scrape failed, falling back to DB:', err.message);
    const limit = 15;
    const offset = (page - 1) * limit;
    const dbItems = await prisma.popularManga.findMany({
      orderBy: { updatedAt: 'desc' },
      skip: offset,
      take: limit
    });
    const results = dbItems.map(item => {
      const linkId = item.mangaDetailLink ? item.mangaDetailLink.split('/').filter(Boolean).pop() : null;
      return {
        id: linkId || item.id,
        title: item.title,
        cover: item.imageUrl,
        description: null,
        status: null,
        genres: [],
        nsfw: false,
        rating: null,
        lastChapter: item.latestChapter,
        lastChapterId: item.latestChapterId,
        latestChapters: [],
        updateDate: null,
        source: 'local',
        popularity: null,
        readCount: 0,
        averageRating: null,
        userRating: null,
      };
    });
    return applyContentFilters(results, userId, false);
  }
}

async function getRecent(page = 1, userId = null) {
  const cacheKey = `recent:${page}`;
  const cached = await cache.get(cacheKey);
  if (cached) return applyContentFilters(cached, userId, false);

  try {
    const { data } = await ingestion.getRecent(page);
    const results = (data.results || []).map(mapManga);
    const filtered = await applyContentFilters(results, userId, false);
    await cache.set(cacheKey, filtered, cache.ttl.searchTtl);
    return filtered;
  } catch (err) {
    console.warn('[MangaService] Recent scrape failed:', err.message);
    return [];
  }
}

async function getPopularCompleted(userId = null) {
  try {
    let list = await prisma.popularCompletedManga.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    if (!list || list.length === 0) {
      try {
        const { data } = await ingestion.getPopularCompleted();
        const items = (data.results || []).slice(0, 15);
        for (const item of items) {
          const slug = item.id.replace(/\/$/, '').split('/').pop();
          const existing = await prisma.popularCompletedManga.findFirst({ where: { slug } });
          if (existing) {
            await prisma.popularCompletedManga.update({
              where: { id: existing.id },
              data: {
                title: item.title,
                image: item.cover || item.image || '',
                chapters: item.lastChapter || null,
                updatedAt: new Date()
              }
            });
          } else {
            await prisma.popularCompletedManga.create({
              data: {
                slug,
                title: item.title,
                image: item.cover || item.image || '',
                chapters: item.lastChapter || null
              }
            });
          }
        }
        list = await prisma.popularCompletedManga.findMany({
          orderBy: { createdAt: 'desc' },
          take: 15
        });
      } catch (err) {
        console.warn('[MangaService] Fallback scrape for popular completed failed:', err.message);
      }
    }

    const mapped = list.map(m => ({
      id: m.slug,
      title: m.title,
      cover: m.image,
      description: null,
      status: null,
      genres: [],
      nsfw: false,
      rating: null,
      lastChapter: m.chapters,
      lastChapterId: null,
      latestChapters: [],
      updateDate: null,
      source: 'local',
      popularity: null,
      readCount: 0,
      averageRating: null,
      userRating: null,
    }));
    return applyContentFilters(mapped, userId, false);
  } catch (err) {
    console.error('[MangaService] getPopularCompleted failed:', err);
    throw err;
  }
}

async function seedPopularCompleted() {
  try {
    const { data } = await ingestion.getPopularCompleted();
    const items = (data.results || []).slice(0, 15);
    
    for (const item of items) {
      const slug = item.id.replace(/\/$/, '').split('/').pop();
      const existing = await prisma.popularCompletedManga.findFirst({ where: { slug } });
      if (existing) {
        await prisma.popularCompletedManga.update({
          where: { id: existing.id },
          data: {
            title: item.title,
            image: item.cover || item.image || '',
            chapters: item.lastChapter || null,
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.popularCompletedManga.create({
          data: {
            slug,
            title: item.title,
            image: item.cover || item.image || '',
            chapters: item.lastChapter || null
          }
        });
      }
    }
    console.log(`[MangaService] Seeded ${items.length} popular completed manga`);
  } catch (err) {
    console.error('[MangaService] seedPopularCompleted failed:', err);
  }
}

async function getPopularByScore(limit = 20, userId = null) {
  try {
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
  const useCache = !filters.keyword;
  const cacheKey = `browse:${JSON.stringify(filters)}`;
  if (useCache) {
    const cached = await cache.get(cacheKey);
    if (cached) return applyContentFiltersToBrowseResult(cached, userId);
  }

  const targetCount = 27;
  let results = [];
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

  while (results.length < targetCount && attempts < 10) {
    const skip = ((currentPage - 1) * targetCount) + results.length;
    const take = targetCount - results.length;
    let dbResults = [];
    try {
      const where = {
        isHidden: false,
        NOT: { id: { startsWith: 'atsumoe:' } }
      };
      if (filters.include && filters.include.length > 0) {
        where.genres = { hasSome: filters.include };
      }
      if (filters.status) {
        where.status = filters.status === '1' ? 'Ongoing' : filters.status === '2' ? 'Completed' : undefined;
      }
      if (filters.keyword) {
        where.OR = [
          { title: { contains: filters.keyword, mode: 'insensitive' } },
          { description: { contains: filters.keyword, mode: 'insensitive' } },
          { genres: { hasSome: [filters.keyword, filters.keyword.toLowerCase(), filters.keyword.toUpperCase()] } }
        ];
      }
      dbResults = await prisma.manga.findMany({
        where,
        skip,
        take
      });
    } catch (dbErr) {
      console.warn('[MangaService] Browse DB query failed:', dbErr.message);
      break;
    }
    if (dbResults.length === 0) break;
    const mapped = dbResults.map(mapManga);
    const filtered = await applyContentFilters(mapped, userId, isExplicit);
    results = [...results, ...filtered];
    if (results.length >= targetCount) break;
    currentPage++;
    attempts++;
  }

  if (results.length === 0 && filters.include && filters.include.length > 0) {
    try {
      const { data } = await ingestion.browseManga(filters);
      const mapped = (data.results || []).map(mapManga);
      const filtered = await applyContentFilters(mapped, userId, isExplicit);
      results = filtered.slice(0, targetCount);
    } catch (scrapeErr) {
      console.warn('[MangaService] Browse scrape fallback failed:', scrapeErr.message);
    }
  }

  const finalData = {
    results: results.slice(0, targetCount),
    currentPage: filters.page || 1,
    totalResults: results.length,
    totalPages: 1
  };

  if (useCache) {
    await cache.set(cacheKey, finalData, cache.ttl.searchTtl);
  }
  return finalData;
}

async function rateManga(userId, mangaId, score) {
  try {
    const existing = await prisma.manga.findUnique({ where: { id: mangaId } });
    if (!existing) {
      throw new Error('Manga not found in local database');
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
  if (!manga || !manga.genres || manga.genres.length === 0) return [];
  const related = await prisma.manga.findMany({
    where: {
      id: { not: mangaId },
      isHidden: false,
      nsfw: userId ? undefined : false,
      genres: { hasSome: manga.genres },
      NOT: { id: { startsWith: 'atsumoe:' } }
    },
    take: 12,
    orderBy: { readCount: 'desc' }
  });
  const mapped = related.map(mapManga);
  return applyContentFilters(mapped, userId, false);
}

async function trackSearch(keyword) {
  if (!keyword) return;
  prisma.searchKeyword.upsert({
    where: { keyword: keyword.toLowerCase() },
    update: { count: { increment: 1 } },
    create: { keyword: keyword.toLowerCase(), count: 1 }
  }).catch(() => { });
}

async function refreshMangaInfoBackground(mangaId) {
  const cacheKey = `manga:${mangaId}`;
  const { data } = await ingestion.getMangaInfo(mangaId);
  let mapped = mapManga(data);

  const chaptersCacheKey = `chapters:${mangaId}`;
  const rawChapters = data.chapters || [];
  const mappedChapters = rawChapters.map((ch) => ({
    id: ch.id || ch.href,
    number: ch.chapterNumber || parseFloat((ch.title || '').match(/(\d+(\.\d+)?)/)?.[1] || '0'),
    title: ch.title || null,
    sources: [data.source || 'manganato'],
    mangaId,
  })).filter(ch => ch.id && !isNaN(ch.number));

  let lastChapter = mapped.lastChapter || null;
  let lastChapterId = mapped.lastChapterId || null;
  if (mappedChapters.length > 0) {
    const latest = mappedChapters[mappedChapters.length - 1];
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

  await cache.set(chaptersCacheKey, mappedChapters, cache.ttl.chaptersTtl);
  await cache.set(cacheKey, mapped, cache.ttl.mangaTtl);
}

function startPopularMangaSync() {
  console.log('[Scheduler] Initializing 24-hour popular manga sync job...');

  const runSync = async () => {
    console.log(`[Scheduler] Starting 24-hour refresh for popular manga...`);
    try {
      const { data } = await ingestion.getPopular(1);
      const items = data.results || [];
      for (const item of items.slice(0, 20)) {
        try {
          const mapped = mapManga(item);
          await prisma.popularManga.upsert({
            where: { id: mapped.id },
            update: {
              title: mapped.title,
              imageUrl: mapped.cover || mapped.image || '',
              mangaDetailLink: `/manga/${mapped.id}`,
              latestChapter: mapped.lastChapter || 'Read Now',
              latestChapterId: mapped.lastChapterId || mapped.id,
              updatedAt: new Date()
            },
            create: {
              id: mapped.id,
              title: mapped.title,
              imageUrl: mapped.cover || mapped.image || '',
              mangaDetailLink: `/manga/${mapped.id}`,
              latestChapter: mapped.lastChapter || 'Read Now',
              latestChapterId: mapped.lastChapterId || mapped.id
            }
          });
          console.log(`[Scheduler] Synced popular manga metadata: ${mapped.title}`);
        } catch (err) {
          console.error(`[Scheduler] Failed to refresh popular manga ${item.id}:`, err.message);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.error('[Scheduler] Popular sync failed:', err.message);
    }
    console.log('[Scheduler] 24-hour popular manga sync completed.');
  };

  setTimeout(runSync, 10000);
  setInterval(runSync, 24 * 60 * 60 * 1000);
}

module.exports = {
  search,
  getMangaInfo,
  getChapters,
  getChapterPages,
  getPopular,
  getRecent,
  getPopularByScore,
  getPopularCompleted,
  browse,
  rateManga,
  getRelated,
  trackSearch,
  refreshMangaInfoBackground,
  startPopularMangaSync,
  seedPopularCompleted
};
