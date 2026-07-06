'use strict';
/**
 * DATA INGESTION LAYER - TURBO SYNC ENGINE 🏎️
 * Races multiple sources to ensure Mani Reader has the FASTEST updates.
 */

const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const config = require('../config/env');
const mangakatana = require('./mangakatanaScraper');
const mangapill = require('./mangapillScraper');
const mangadex = require('./mangadexScraper');
const allmanga = require('./allmangaScraper');

const client = axios.create({
  baseURL: config.consumet.url || 'https://api.consumet.org',
  timeout: 30000,
});

axiosRetry(client, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});

const provider = config.consumet.primary || 'mangakatana';

/**
 * GLOBAL CONTENT SHIELD 🛡️
 */
const STRICT_BLACKLIST_TAGS = [
  '18+', 'smut', 'erotica', 'sexual-violence', 'sexual violence', 'yaoi', 'yuri',
  'incest', 'ecchi', 'hentai', 'pornographic', 'loli', 'shota'
];
const BORDERLINE_TAGS = ['harem', 'adult', 'mature', 'josei', 'gore'];

const BLACKLIST_KEYWORDS = ['sexy', 'sex', 'thot', 'nude', 'porn', 'hentai', 'uncensored', 'sexual', 'unfiltered', 'erotic', 'smut', 'harem'];

function checkIsNSFW(genres = [], isAdult = false, isNsfwFlag = false) {
  const genreList = genres.map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase().trim());
  
  const hasStrictBlacklist = genreList.some(tag => 
    STRICT_BLACKLIST_TAGS.some(bad => tag === bad || tag.includes(bad))
  );
  if (hasStrictBlacklist || isAdult || isNsfwFlag) {
    return true;
  }

  const borderlineCount = genreList.filter(tag => 
    BORDERLINE_TAGS.some(border => tag === border || tag.includes(border))
  ).length;

  return borderlineCount > 1;
}

function filterNSFW(mangaList, bypass = false) {
  if (!Array.isArray(mangaList)) return [];
  if (bypass) return mangaList; // 🚀 Unlock everything for explicit searches

  return mangaList.filter(m => {
    const genres = m.genres || [];
    const isNsfw = m.nsfw || checkIsNSFW(genres, m.isAdult, m.nsfw);
    if (isNsfw) return false;

    const title = (m.title || '').toLowerCase();
    const desc = (m.description || '').toLowerCase();

    // Keyword in title
    const hasBadTitle = BLACKLIST_KEYWORDS.some(word => title.includes(word));
    // Keyword in description
    const hasBadDesc = BLACKLIST_KEYWORDS.some(word => desc.includes(word));

    return !hasBadTitle && !hasBadDesc;
  });
}

function mapMangaFormat(m) {
  const isNsfw = m.nsfw || checkIsNSFW(m.genres || [], m.isAdult, m.nsfw);

  return {
    id: m.id,
    title: m.title,
    image: m.image || m.cover || null,
    description: m.description || null,
    status: m.status || 'Unknown',
    nsfw: isNsfw,
    genres: m.genres || [],
    lastChapter: m.lastChapter,
    lastChapterId: m.lastChapterId,
    latestChapters: m.latestChapters || [],
    updateDate: m.updateDate || null,
    source: m.source || provider,
  };
}

/**
 * 🏎️ TURBO SYNC: Races MangaKatana and MangaPill to find the latest chapter.
 */
async function syncLatestChapter(manga) {
  try {
    // If it's a search result, try to find it on MangaPill too for a newer chapter
    if (manga.source === 'mangakatana') {
      const pillRes = await mangapill.searchManga(manga.title);
      const match = pillRes.results.find(m => m.title.toLowerCase() === manga.title.toLowerCase());

      if (match) {
        // ⚡ Turbo Sync: Fetch full info to get the chapter list
        const pillInfo = await mangapill.getMangaInfo(match.id);
        if (pillInfo && pillInfo.chapters?.length > 0) {
          const latestPill = pillInfo.chapters[0]; // MangaPill lists latest first
          const katNum = parseFloat(manga.lastChapter?.match(/[\d.]+/)?.[0] || '0');
          const pillNum = parseFloat(latestPill.chapterNumber || '0');

          if (pillNum > katNum) {
            manga.lastChapter = `Chapter ${pillNum}`;
            manga.lastChapterId = `mangapill:${latestPill.id}`;
          }
        }
      }
    }
  } catch (err) {
    // Silent fail
  }
  return manga;
}

async function searchManga(query, page = 1) {
  let results = [];
  const existingTitles = new Set();
  let searchSource = 'mangakatana';

  try {
    const katRes = await mangakatana.searchManga(query, page);
    const list = filterNSFW(katRes.results || [], true);
    
    list.forEach(m => {
      const formatted = mapMangaFormat(m);
      const titleLower = formatted.title.toLowerCase();
      const queryLower = query.toLowerCase().trim();
      
      const matchTitle = titleLower.includes(queryLower);
      const matchGenre = (formatted.genres || []).some(g => g.toLowerCase().includes(queryLower));
      const isRelevant = matchTitle || matchGenre;
      
      if (isRelevant && !existingTitles.has(titleLower)) {
        existingTitles.add(titleLower);
        
        let score = 0;
        if (titleLower === queryLower) score += 100;
        else if (titleLower.startsWith(queryLower)) score += 50;
        else if (titleLower.includes(queryLower)) score += 20;

        results.push({ ...formatted, source: 'mangakatana', searchScore: score });
      }
    });

    if (results.length > 0) {
      results.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
      return {
        data: {
          results,
          totalResults: katRes.totalResults || results.length,
          totalPages: katRes.totalPages || 1,
          currentPage: page,
          hasNextPage: katRes.hasNextPage || false
        }
      };
    }
  } catch (err) {
    console.error('[Ingestion] Katana search failed:', err.message);
  }

  // Fallback to MangaDex if MangaKatana results are empty / not available
  try {
    console.log(`[Ingestion] MangaKatana returned no results. Querying MangaDex fallback for "${query}"`);
    const dexRes = await mangadex.searchManga(query, page);
    const list = filterNSFW(dexRes.results || [], true);

    list.forEach(m => {
      const formatted = mapMangaFormat(m);
      const titleLower = formatted.title.toLowerCase();
      const queryLower = query.toLowerCase().trim();
      
      const matchTitle = titleLower.includes(queryLower);
      const matchGenre = (formatted.genres || []).some(g => g.toLowerCase().includes(queryLower));
      const isRelevant = matchTitle || matchGenre;
      
      if (isRelevant && !existingTitles.has(titleLower)) {
        existingTitles.add(titleLower);
        
        let score = 0;
        if (titleLower === queryLower) score += 100;
        else if (titleLower.startsWith(queryLower)) score += 50;
        else if (titleLower.includes(queryLower)) score += 20;

        results.push({ ...formatted, source: 'mangadex', searchScore: score });
      }
    });

    results.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));

    return {
      data: {
        results,
        totalResults: dexRes.totalResults || results.length,
        totalPages: dexRes.totalPages || 1,
        currentPage: page,
        hasNextPage: dexRes.hasNextPage || false
      }
    };
  } catch (err) {
    console.error('[Ingestion] MangaDex search failed:', err.message);
    return { data: { results: [], totalResults: 0, totalPages: 1 } };
  }
}

async function getPopular(page = 1, genre = null) {
  // 🔥 Order: Hot (MangaKatana Home Page Trending)
  const data = await mangakatana.getPopular(page, genre);
  // Genre-specific popular lists are semi-explicit if a genre is picked, but we keep safe for home
  const results = filterNSFW(data.results, !!genre).map(mapMangaFormat);
  return { data: { ...data, results } };
}

async function getRecent(page = 1) {
  // ✨ Order: Latest (MangaKatana Home Page Recent Uploads)
  const data = await mangakatana.getRecent(page);
  const results = filterNSFW(data.results).map(mapMangaFormat);
  return { data: { results } };
}

async function getMangaInfo(mangaId) {
  // Determine source from prefix
  let actualId = mangaId;
  let currentProvider = provider;

  if (mangaId.includes(':')) {
    const parts = mangaId.split(':');
    currentProvider = parts[0];
    actualId = parts[1];
  }

  if (currentProvider === 'mangapill') {
    const data = await mangapill.getMangaInfo(actualId);
    return { data };
  }
  
  if (currentProvider === 'mangadex') {
    const data = await mangadex.getMangaInfo(actualId);
    return { data };
  }
  
  if (currentProvider === 'allmanga') {
    const data = await allmanga.getMangaInfo(actualId);
    return { data };
  }

  const data = await mangakatana.getMangaInfo(actualId);
  return { data };
}

async function getChapterPages(chapterId) {
  if (chapterId.includes('mangapill:')) {
    const data = await mangapill.getChapterPages(chapterId.replace('mangapill:', ''));
    return { data };
  }
  if (chapterId.includes('mangadex:')) {
    const data = await mangadex.getChapterPages(chapterId.replace('mangadex:', ''));
    return { data };
  }
  if (chapterId.includes('allmanga:')) {
    const data = await allmanga.getChapterPages(chapterId.replace('allmanga:', ''));
    return { data };
  }
  const data = await mangakatana.getChapterPages(chapterId.replace('mangakatana:', ''));
  return { data };
}

async function browseManga(filters) {
  // ⚡ If keyword is present, treat it as an explicit search to leverage all providers
  if (filters.keyword || filters.q) {
    const res = await searchManga(filters.keyword || filters.q, filters.page || 1);
    return res;
  }

  const data = await mangakatana.browseManga(filters);
  const isExplicit = !!filters.keyword || (filters.include && filters.include.length > 0);
  data.results = filterNSFW(data.results, isExplicit).map(mapMangaFormat);
  return { data };
}

module.exports = {
  searchManga,
  getMangaInfo,
  getChapterPages,
  getRecent,
  getPopular,
  browseManga
};
