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

const BLACKLIST_KEYWORDS = ['sexy', 'thot', 'nude', 'porn', 'hentai', 'uncensored'];

function filterNSFW(mangaList) {
  if (!Array.isArray(mangaList)) return [];
  return mangaList.filter(m => {
    if (m.nsfw) return false;
    const genres = (m.genres || []).map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase());
    const title = (m.title || '').toLowerCase();
    
    const hasBadTag = genres.some(tag => BLACKLIST_TAGS.includes(tag));
    const hasBadWord = BLACKLIST_KEYWORDS.some(word => title.includes(word));
    
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
    lastChapterId: m.lastChapterId,
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
       if (match && match.lastChapter) {
          // Compare chapter numbers
          const katNum = parseFloat(manga.lastChapter?.match(/[\d.]+/)?.[0] || '0');
          const pillNum = parseFloat(match.lastChapter?.match(/[\d.]+/)?.[0] || '0');
          if (pillNum > katNum) {
             manga.lastChapter = match.lastChapter;
             manga.lastChapterId = match.lastChapterId;
          }
       }
    }
  } catch (err) {
    // Silent fail, just use original
  }
  return manga;
}

async function searchManga(query, page = 1) {
  // Use MangaKatana as primary, but sync with MangaPill for speed
  const data = await mangakatana.searchManga(query, page);
  let results = filterNSFW(data.results).map(mapMangaFormat);
  
  // Parallel Turbo Sync for first 5 results
  results = await Promise.all(results.slice(0, 5).map(syncLatestChapter));
  
  return { data: { ...data, results } };
}

async function getPopular(page = 1) {
  const data = await mangakatana.getPopular(page);
  const results = filterNSFW(data.results).map(mapMangaFormat);
  return { data: { results } };
}

async function getRecent(page = 1) {
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

  const data = await mangakatana.getMangaInfo(actualId);
  return { data };
}

async function getChapterPages(chapterId) {
  if (chapterId.includes('mangapill:')) {
     const data = await mangapill.getChapterPages(chapterId.replace('mangapill:', ''));
     return { data };
  }
  const data = await mangakatana.getChapterPages(chapterId.replace('mangakatana:', ''));
  return { data };
}

async function browseManga(filters) {
  const data = await mangakatana.browseManga(filters);
  data.results = filterNSFW(data.results).map(mapMangaFormat);
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
