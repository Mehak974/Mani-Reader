'use strict';
/**
 * DATA INGESTION LAYER
 * Routes all manga data retrieval to MangaKatanaScraper.
 */

const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const config = require('../config/env');
const mangakatana = require('./mangakatanaScraper');

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
const BLACKLIST_TAGS = [
  '18+', 'adult', 'smut', 'erotica', 'sexual-violence', 'sexual violence', 'harem', 'yaoi', 'yuri',
  'incest', 'gore', 'mature', 'ecchi', 'hentai', 'pornographic', 'loli', 'shota'
];

const BLACKLIST_KEYWORDS = ['sexy', 'sex', 'thot', 'nude', 'porn', 'hentai', 'uncensored', 'sexual', 'unfiltered', 'erotic', 'smut', 'harem'];

function filterNSFW(mangaList, bypass = false) {
  if (!Array.isArray(mangaList)) return [];
  if (bypass) return mangaList; // 🚀 Unlock everything for explicit searches

  return mangaList.filter(m => {
    if (m.nsfw) return false;
    const genres = (m.genres || []).map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase());
    const title = (m.title || '').toLowerCase();
    const desc = (m.description || '').toLowerCase();

    // Exact tag match against blacklist
    const hasBadTag = genres.some(tag =>
      BLACKLIST_TAGS.some(bad => tag === bad || tag.includes(bad) || bad.includes(tag))
    );
    // Keyword in title
    const hasBadTitle = BLACKLIST_KEYWORDS.some(word => title.includes(word));
    // Keyword in description
    const hasBadDesc = BLACKLIST_KEYWORDS.some(word => desc.includes(word));

    return !hasBadTag && !hasBadTitle && !hasBadDesc;
  });
}

function mapMangaFormat(m) {
  const genres = (m.genres || []).map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase());
  const isNsfw = !!(
    m.isAdult || 
    m.nsfw || 
    genres.some(tag => BLACKLIST_TAGS.some(bad => tag === bad || tag.includes(bad)))
  );

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
    updateDate: m.updateDate || null,
    source: m.source || provider,
  };
}

async function searchManga(query, page = 1) {
  try {
    const res = await mangakatana.searchManga(query, page);
    const results = (res.results || []).map(mapMangaFormat);
    return {
      data: {
        ...res,
        results
      }
    };
  } catch (err) {
    console.error('[Ingestion] MangaKatana search failed:', err.message);
    return { data: { results: [], currentPage: page, hasNextPage: false } };
  }
}

async function getMangaInfo(mangaId) {
  const actualId = mangaId.includes(':') ? mangaId.split(':').pop() : mangaId;
  const data = await mangakatana.getMangaInfo(actualId);
  return { data };
}

async function getChapterPages(chapterId) {
  const actualId = chapterId.includes(':') ? chapterId.split(':').pop() : chapterId;
  const pages = await mangakatana.getChapterPages(actualId);
  return { data: pages };
}

async function browseManga(filters) {
  // If keyword is present, treat it as search
  if (filters.keyword || filters.q) {
    return searchManga(filters.keyword || filters.q, filters.page || 1);
  }

  const data = await mangakatana.browseManga(filters);
  const isExplicit = !!filters.keyword || (filters.include && filters.include.length > 0);
  data.results = filterNSFW(data.results, isExplicit).map(mapMangaFormat);
  return { data };
}

async function getPopular(page = 1, genre = null) {
  const data = await mangakatana.getPopular(page, genre);
  const results = filterNSFW(data.results, !!genre).map(mapMangaFormat);
  return { data: { ...data, results } };
}

async function getRecent(page = 1) {
  const data = await mangakatana.getRecent(page);
  const results = filterNSFW(data.results).map(mapMangaFormat);
  return { data: { results } };
}

module.exports = {
  searchManga,
  getMangaInfo,
  getChapterPages,
  getRecent,
  getPopular,
  browseManga
};
