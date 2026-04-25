'use strict';
/**
 * DATA INGESTION LAYER - DIRECT SCRAPERS & CONSUMET API
 */

const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const config = require('../config/env');
const mangakatana = require('./mangakatanaScraper');

const client = axios.create({
  baseURL: config.consumet.url || 'https://api.consumet.org',
  timeout: 20000,
});

axiosRetry(client, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});

const provider = config.consumet.primary || 'mangakakalot';

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapMangaFormat(m) {
  return {
    id: m.id,
    title: m.title,
    image: m.image || m.cover || null,
    description: m.description || null,
    status: m.status || 'Unknown',
    nsfw: m.isAdult || m.nsfw || false,
    genres: m.genres || [],
    source: m.source || provider,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

async function searchManga(query, page = 1) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.searchManga(query, page);
    return { data };
  }

  try {
    const res = await client.get(`/manga/${provider}/${encodeURIComponent(query)}`, {
      params: { page }
    });
    
    const results = res.data.results || [];
    return {
      data: {
        currentPage: page,
        results: results.map(mapMangaFormat)
      }
    };
  } catch (err) {
    console.error(`[Ingestion] searchManga failed (${provider}):`, err.message);
    // If local fails, try public as fallback
    if (client.defaults.baseURL !== 'https://api.consumet.org') {
       // Fallback
       try {
         const publicRes = await axios.get(`https://api.consumet.org/manga/${provider}/${encodeURIComponent(query)}`, { params: { page } });
         return { data: { currentPage: page, results: (publicRes.data.results || []).map(mapMangaFormat) } };
       } catch (fallbackErr) {
         console.error('[Ingestion] Fallback search failed:', fallbackErr.message);
       }
    }
    throw err;
  }
}

async function getPopular(page = 1) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.getPopular(page);
    return { data };
  }
  return { data: { results: [] } };
}

async function getRecent(page = 1) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.getRecent(page);
    return { data };
  }
  return { data: { results: [] } };
}

async function getMangaInfo(mangaId) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.getMangaInfo(mangaId);
    return { data };
  }

  try {
    const res = await client.get(`/manga/${provider}/info/${mangaId}`);
    const m = res.data;
    const mappedManga = mapMangaFormat(m);

    mappedManga.chapters = (m.chapters || []).map(c => ({
      id: c.id,
      chapterNumber: c.number || '0',
      title: c.title || `Chapter ${c.number || '0'}`,
      externalUrl: null,
      source: provider
    }));
    
    return { data: mappedManga };
  } catch (err) {
    console.error(`[Ingestion] getMangaInfo failed (${provider}):`, err.message);
    if (client.defaults.baseURL !== 'https://api.consumet.org') {
        try {
          const publicRes = await axios.get(`https://api.consumet.org/manga/${provider}/info/${mangaId}`);
          const m = publicRes.data;
          const mappedManga = mapMangaFormat(m);
          mappedManga.chapters = (m.chapters || []).map(c => ({
              id: c.id,
              chapterNumber: c.number || '0',
              title: c.title || `Chapter ${c.number || '0'}`,
              source: provider
          }));
          return { data: mappedManga };
        } catch (fallbackErr) {
           console.error('[Ingestion] Fallback info failed:', fallbackErr.message);
        }
    }
    throw err;
  }
}

async function getChapterPages(chapterId) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.getChapterPages(chapterId);
    return { data };
  }

  try {
    const res = await client.get(`/manga/${provider}/read/${chapterId}`);
    const pages = (res.data || []).map(p => p.img || p.page || p);
    return { data: pages };
  } catch (err) {
    console.error(`[Ingestion] getChapterPages failed (${provider}):`, err.message);
    if (client.defaults.baseURL !== 'https://api.consumet.org') {
        try {
          const publicRes = await axios.get(`https://api.consumet.org/manga/${provider}/read/${chapterId}`);
          const pages = (publicRes.data || []).map(p => p.img || p.page || p);
          return { data: pages };
        } catch (fallbackErr) {
          console.error('[Ingestion] Fallback pages failed:', fallbackErr.message);
        }
    }
    throw err;
  }
}

async function browseManga(filters) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.browseManga(filters);
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

