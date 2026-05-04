'use strict';
const axios = require('axios');
const config = require('../config/env');
const mangakatana = require('./mangakatanaScraper');
const mangadex = require('./mangadexScraper');
const comick = require('./comickScraper');
const mangapill = require('./mangapillScraper');

/**
 * GLOBAL CONTENT SHIELD 🛡️
 * Strict filtering to keep the site clean and premium.
 */
const BLACKLIST_TAGS = [
  '18+', 'adult', 'smut', 'erotica', 'sexual-violence', 'sexual violence', 'harem', 'yaoi', 'yuri', 
  'incest', 'gore', 'mature', 'ecchi', 'hentai', 'pornographic'
];

const BLACKLIST_KEYWORDS = ['sexual', 'unfiltered', 'uncensored', 'erotic', 'smut', 'porn', 'hentai'];

function filterNSFW(mangaList) {
  if (!Array.isArray(mangaList)) return [];
  return mangaList.filter(m => {
    if (m.nsfw) return false;
    const genres = (m.genres || []).map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase());
    const desc = (m.description || '').toLowerCase();
    const title = (m.title || '').toLowerCase();

    const hasBadTag = genres.some(tag => BLACKLIST_TAGS.includes(tag));
    const hasBadWord = BLACKLIST_KEYWORDS.some(word => desc.includes(word) || title.includes(word));

    return !hasBadTag && !hasBadWord;
  });
}

const client = axios.create({
  baseURL: config.consumet.url || 'https://api.consumet.org',
  timeout: 30000,
});

const provider = config.consumet.primary || 'comick';

function mapMangaFormat(m) {
  return {
    id: m.id,
    title: m.title,
    image: m.image || m.cover,
    description: m.description,
    status: m.status,
    genres: m.genres || [],
    lastChapter: m.lastChapter,
    rating: m.rating,
    source: m.source
  };
}

async function searchManga(query, page = 1) {
  // Use MangaPill + MangaKatana for Speed & Stability
  const providers = ['mangapill', 'mangakatana'];
  const allResults = [];
  const seenTitles = new Set();

  for (const p of providers) {
    try {
      let results = [];
      if (p === 'mangapill') {
        const res = await mangapill.searchManga(query);
        results = res.results.map(m => ({ ...m, id: `mangapill:${m.id}` }));
      } else if (p === 'mangakatana') {
        const res = await mangakatana.searchManga(query, page);
        results = res.results.map(m => ({ ...m, id: `mangakatana:${m.id}` }));
      }
      
      const filtered = filterNSFW(results);
      for (const m of filtered) {
        if (!seenTitles.has(m.title.toLowerCase())) {
          allResults.push(m);
          seenTitles.add(m.title.toLowerCase());
        }
      }
    } catch (err) {
      console.error(`[Ingestion] Search failed for ${p}:`, err.message);
    }
  }

  return { results: allResults };
}

async function getPopular(page = 1) {
  // Use MangaKatana for the Home Page Popular section (High Reliability)
  try {
    const data = await mangakatana.getPopular(page);
    return {
      data: {
        results: filterNSFW((data.results || []).map(m => ({ 
          ...m, 
          id: `mangakatana:${m.id}`,
          image: m.image?.startsWith('http') ? `/api/image?url=${encodeURIComponent(m.image)}` : m.image 
        })))
      }
    };
  } catch (err) {
    console.error('[Ingestion] getPopular (MangaKatana) failed:', err.message);
    return { data: { results: [] } };
  }
}

async function getRecent(page = 1) {
  // Use MangaKatana for Recently Added (Reliable tags and chapter counts)
  try {
    const data = await mangakatana.getRecent(page);
    return {
      data: {
        results: filterNSFW((data.results || []).map(m => ({ 
          ...m, 
          id: `mangakatana:${m.id}`,
          image: m.image?.startsWith('http') ? `/api/image?url=${encodeURIComponent(m.image)}` : m.image 
        })))
      }
    };
  } catch (err) {
    console.error('[Ingestion] getRecent (MangaKatana) failed:', err.message);
    return { data: { results: [] } };
  }
}

async function getMangaInfo(mangaId) {
  let mainProvider = provider;
  if (mangaId.includes(':')) {
    const [p, id] = mangaId.split(':');
    mainProvider = p;
    mangaId = id;
  }

  try {
    if (mainProvider === 'mangapill') {
      const info = await mangapill.getMangaInfo(mangaId);
      if (info) {
        info.chapters = (info.chapters || []).map(c => ({
          ...c,
          id: `mangapill:${c.id}`,
          source: 'mangapill'
        }));
        return { data: info };
      }
    }
    if (mainProvider === 'mangakatana') {
      const data = await mangakatana.getMangaInfo(mangaId);
      return { data };
    }
    if (mainProvider === 'comick') {
      const info = await comick.getMangaInfo(mangaId);
      if (info && info.hid) {
        const chapters = await comick.getChapters(info.hid);
        info.chapters = chapters.map(c => ({
          ...c,
          id: `comick:${c.id}`,
          chapterNumber: c.chapterNum,
          source: 'comick'
        }));
        return { data: info };
      }
    }
    
    // Fallback to Consumet
    const res = await client.get(`/manga/${mainProvider}/info/${mangaId}`);
    return { data: mapMangaFormat(res.data) };
  } catch (err) {
    console.error(`[Ingestion] getMangaInfo failed (${mainProvider}:${mangaId}):`, err.message);
    throw err;
  }
}

async function getChapterPages(mangaId, chapterId) {
  let mainProvider = provider;
  if (mangaId && mangaId.includes(':')) {
    const [p, id] = mangaId.split(':');
    mainProvider = p;
    mangaId = id;
  }

  if (mainProvider === 'mangapill') {
    const pages = await mangapill.getChapterPages(chapterId);
    return { data: pages };
  }
  if (mainProvider === 'mangakatana') {
    const data = await mangakatana.getChapterPages(chapterId);
    return { data };
  }
  if (mainProvider === 'comick') {
    const pages = await comick.getChapterPages(chapterId);
    return { data: pages };
  }

  const res = await client.get(`/manga/${mainProvider}/read`, {
    params: { chapterId }
  });
  return { data: res.data.map(p => p.img || p.image || p) };
}

module.exports = {
  searchManga,
  getMangaInfo,
  getChapterPages,
  getPopular,
  getRecent,
  filterNSFW
};
