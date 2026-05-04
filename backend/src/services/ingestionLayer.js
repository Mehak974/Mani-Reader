'use strict';
/**
 * DATA INGESTION LAYER - STABLE MANGAKATANA ENGINE
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
  'incest', 'gore', 'mature', 'ecchi', 'hentai', 'pornographic'
];

const BLACKLIST_KEYWORDS = ['sexual', 'unfiltered', 'uncensored', 'erotic', 'smut', 'porn', 'hentai', 'sexy', 'thot', 'nude'];

function filterNSFW(mangaList) {
  if (!Array.isArray(mangaList)) return [];
  return mangaList.filter(m => {
    if (m.nsfw) return false;
    const genres = (m.genres || []).map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase());
    const title = (m.title || '').toLowerCase();
    const desc = (m.description || '').toLowerCase();

    const hasBadTag = genres.some(tag => BLACKLIST_TAGS.includes(tag));
    const hasBadWord = BLACKLIST_KEYWORDS.some(word => title.includes(word) || desc.includes(word));

    return !hasBadTag && !hasBadWord;
  });
}

function mapMangaFormat(m) {
  const image = m.image || m.cover || null;
  const proxiedImage = image && image.startsWith('http') ? `/api/image?url=${encodeURIComponent(image)}` : image;

  return {
    id: m.id,
    title: m.title,
    image: proxiedImage,
    description: m.description || null,
    status: m.status || 'Unknown',
    nsfw: m.isAdult || m.nsfw || false,
    genres: m.genres || [],
    lastChapter: m.lastChapter,
    source: m.source || provider,
  };
}

async function searchManga(query, page = 1) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.searchManga(query, page);
    data.results = filterNSFW(data.results).map(mapMangaFormat);
    return { data };
  }

  try {
    const res = await client.get(`/manga/${provider}/${encodeURIComponent(query)}`, {
      params: { page }
    });
    const results = filterNSFW((res.data.results || []).map(mapMangaFormat));
    return { data: { currentPage: page, results } };
  } catch (err) {
    console.error(`[Ingestion] searchManga failed:`, err.message);
    throw err;
  }
}

async function getPopular(page = 1) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.getPopular(page);
    data.results = filterNSFW(data.results).map(mapMangaFormat);
    return { data };
  }
  
  try {
    const res = await client.get(`/manga/${provider}/popular`, { params: { page } });
    const results = filterNSFW((res.data.results || res.data || []).map(mapMangaFormat));
    return { data: { results } };
  } catch (err) {
    console.error(`[Ingestion] getPopular failed:`, err.message);
    return { data: { results: [] } };
  }
}

async function getRecent(page = 1) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.getRecent(page);
    data.results = filterNSFW(data.results).map(mapMangaFormat);
    return { data };
  }

  try {
    const res = await client.get(`/manga/${provider}/recent-updates`, { params: { page } });
    const results = filterNSFW((res.data.results || []).map(mapMangaFormat));
    return { data: { results } };
  } catch (err) {
    console.error(`[Ingestion] getRecent failed:`, err.message);
    return { data: { results: [] } };
  }
}

async function getMangaInfo(mangaId) {
  if (provider === 'mangakatana' || !mangaId.includes(':')) {
    const data = await mangakatana.getMangaInfo(mangaId.replace('mangakatana:', ''));
    return { data };
  }

  try {
    const res = await client.get(`/manga/${provider}/info/${mangaId}`);
    return { data: mapMangaFormat(res.data) };
  } catch (err) {
    console.error(`[Ingestion] getMangaInfo failed:`, err.message);
    throw err;
  }
}

async function getChapterPages(chapterId) {
  if (provider === 'mangakatana' || !chapterId.includes(':')) {
    const data = await mangakatana.getChapterPages(chapterId.replace('mangakatana:', ''));
    return { data };
  }

  try {
    const res = await client.get(`/manga/${provider}/read/${chapterId}`);
    return { data: res.data.map(p => p.img || p.page || p) };
  } catch (err) {
    console.error(`[Ingestion] getChapterPages failed:`, err.message);
    throw err;
  }
}

async function browseManga(filters) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.browseManga(filters);
    data.results = filterNSFW(data.results);
    return { data };
  }
  return { data: { results: [], currentPage: 1, hasNextPage: false } };
}

module.exports = {
  searchManga,
  getMangaInfo,
  getChapterPages,
  getRecent,
  getPopular,
  browseManga
};
