'use strict';
const axios = require('axios');
const config = require('../config/env');
const mangakatana = require('./mangakatanaScraper');
const mangadex = require('./mangadexScraper');
const comick = require('./comickScraper');
const mangapill = require('./mangapillScraper');

/**
 * GLOBAL CONTENT SHIELD 🛡️ (STRENGTHENED)
 */
const BLACKLIST_TAGS = [
  '18+', 'adult', 'smut', 'erotica', 'sexual-violence', 'sexual violence', 'harem', 'yaoi', 'yuri', 
  'incest', 'gore', 'mature', 'ecchi', 'hentai', 'pornographic'
];

const BLACKLIST_KEYWORDS = [
  'sexual', 'unfiltered', 'uncensored', 'erotic', 'smut', 'porn', 'hentai', 'ecchi', 'mature', 
  'sex', 'bastard', 'mistress', 'slave', 'harem', 'pervert'
];

function filterNSFW(mangaList) {
  if (!Array.isArray(mangaList)) return [];
  return mangaList.filter(m => {
    if (m.nsfw) return false;
    const genres = (m.genres || []).map(g => (typeof g === 'string' ? g : g.name || '').toLowerCase());
    const desc = (m.description || '').toLowerCase();
    const title = (m.title || '').toLowerCase();

    // 🕵️ Check Tags
    const hasBadTag = genres.some(tag => BLACKLIST_TAGS.includes(tag));
    if (hasBadTag) return false;

    // 👃 Check Title & Description (Even if genres are empty!)
    const hasBadWord = BLACKLIST_KEYWORDS.some(word => 
      title.includes(` ${word} `) || 
      title.startsWith(`${word} `) || 
      title.endsWith(` ${word}`) ||
      title === word ||
      desc.includes(word)
    );
    if (hasBadWord) return false;

    // 🧪 Aggressive Check: If it has NO tags and title is suspicious, block it
    if (genres.length === 0 && (title.includes('step') || title.includes('wife') || title.includes('mother'))) {
      return false;
    }

    return true;
  });
}

const client = axios.create({
  baseURL: config.consumet.url || 'https://api.consumet.org',
  timeout: 30000,
});

const provider = config.consumet.primary || 'comick';

async function searchManga(query, page = 1) {
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
  try {
    const data = await mangakatana.getPopular(page);
    let results = filterNSFW((data.results || []).map(m => ({ 
      ...m, 
      id: `mangakatana:${m.id}`,
      image: m.image?.startsWith('http') ? `/api/image?url=${encodeURIComponent(m.image)}` : m.image 
    })));

    // 🏎️ Fallback to MangaPill if MangaKatana is empty or filtered
    if (results.length === 0) {
      const pillData = await mangapill.searchManga('popular'); // Mock search
      results = filterNSFW((pillData.results || []).map(m => ({
        ...m,
        id: `mangapill:${m.id}`,
        image: m.image?.startsWith('http') ? `/api/image?url=${encodeURIComponent(m.image)}` : m.image 
      })));
    }

    return { data: { results } };
  } catch (err) {
    console.error('[Ingestion] getPopular failed:', err.message);
    return { data: { results: [] } };
  }
}

async function getRecent(page = 1) {
  try {
    const data = await mangakatana.getRecent(page);
    const results = filterNSFW((data.results || []).map(m => ({ 
      ...m, 
      id: `mangakatana:${m.id}`,
      image: m.image?.startsWith('http') ? `/api/image?url=${encodeURIComponent(m.image)}` : m.image 
    })));
    return { data: { results } };
  } catch (err) {
    console.error('[Ingestion] getRecent failed:', err.message);
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
      if (data) {
        data.image = data.image?.startsWith('http') ? `/api/image?url=${encodeURIComponent(data.image)}` : data.image;
        data.chapters = (data.chapters || []).map(c => ({
          ...c,
          id: `mangakatana:${c.id}`,
          source: 'mangakatana'
        }));
      }
      return { data };
    }
    return { data: null };
  } catch (err) {
    console.error(`[Ingestion] getMangaInfo failed:`, err.message);
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
    const pages = await mangakatana.getChapterPages(chapterId);
    return { data: pages };
  }
  return { data: [] };
}

module.exports = {
  searchManga,
  getMangaInfo,
  getChapterPages,
  getPopular,
  getRecent,
  filterNSFW
};
