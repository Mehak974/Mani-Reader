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
  timeout: 30000,
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
  const providers = [provider, 'manganato', 'mangakakalot'];
  const allResults = [];
  const seenIds = new Set();
  const seenTitles = new Set();

  for (const p of providers) {
    try {
      let results = [];
      if (p === 'mangakatana') {
        const katanaData = await mangakatana.searchManga(query, page);
        results = (katanaData.results || []).map(m => ({ ...m, id: `mangakatana:${m.id}` }));
      } else {
        const res = await client.get(`/manga/${p}/${encodeURIComponent(query)}`, { 
          params: { page },
          timeout: 8000 // Short timeout for speed
        });
        const rawResults = res.data.results || res.data || [];
        results = (Array.isArray(rawResults) ? rawResults : []).map(m => {
          const mapped = mapMangaFormat(m);
          mapped.id = `${p}:${mapped.id}`;
          return mapped;
        });
      }

      for (const m of results) {
        const titleKey = m.title.toLowerCase().trim();
        if (!seenTitles.has(titleKey)) {
          allResults.push(m);
          seenTitles.add(titleKey);
        }
      }
      
      // If we already have a good number of results, we can stop early for speed
      if (allResults.length >= 20) break;
    } catch (err) {
      console.warn(`[Ingestion] Search provider ${p} failed:`, err.message);
    }
  }

  return { 
    data: { 
      currentPage: page, 
      results: allResults,
      totalResults: allResults.length,
      hasNextPage: false // Merged results usually don't support simple pagination
    } 
  };
}

async function getPopular(page = 1) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.getPopular(page);
    return {
      data: {
        ...data,
        results: (data.results || []).map(m => ({ ...m, id: `${provider}:${m.id}` }))
      }
    };
  }
  
  try {
    const res = await client.get(`/manga/${provider}/popular`, { params: { page } });
    const results = res.data.results || res.data || [];
    const mappedResults = (Array.isArray(results) ? results : []).map(m => {
      const mapped = mapMangaFormat(m);
      mapped.id = `${provider}:${mapped.id}`;
      return mapped;
    });
    
    return { data: { results: mappedResults } };
  } catch (err) {
    console.error(`[Ingestion] getPopular failed (${provider}):`, err.message);
    return { data: { results: [] } };
  }
}

async function getRecent(page = 1) {
  if (provider === 'mangakatana') {
    const data = await mangakatana.getRecent(page);
    return {
      data: {
        ...data,
        results: (data.results || []).map(m => ({ ...m, id: `${provider}:${m.id}` }))
      }
    };
  }

  try {
    const res = await client.get(`/manga/${provider}/recent-updates`, { params: { page } });
    const mappedResults = (res.data.results || []).map(m => {
      const mapped = mapMangaFormat(m);
      mapped.id = `${provider}:${mapped.id}`;
      return mapped;
    });
    return { data: { results: mappedResults } };
  } catch (err) {
    console.error(`[Ingestion] getRecent failed (${provider}):`, err.message);
    return { data: { results: [] } };
  }
}

async function getMangaInfo(mangaId) {
  let mainProvider = provider;
  
  // 🛡️ Source-Aware IDs: If ID contains a colon (e.g. "mangakakalot:id"), use that provider
  if (mangaId.includes(':')) {
    const [p, id] = mangaId.split(':');
    mainProvider = p;
    mangaId = id;
  }

  try {
    if (mainProvider === 'mangakatana') {
      const data = await mangakatana.getMangaInfo(mangaId);
      return { data };
    }
    const res = await client.get(`/manga/${mainProvider}/info/${mangaId}`);
    const m = res.data;
    const mappedManga = mapMangaFormat(m);
    mappedManga.chapters = (m.chapters || []).map(c => ({
      id: `${mainProvider}:${c.id}`,
      chapterNumber: c.number || '0',
      title: c.title || `Chapter ${c.number || '0'}`,
      source: mainProvider
    }));
    return { data: mappedManga };
  } catch (err) {
    console.error(`[Ingestion] getMangaInfo failed (${mainProvider}):`, err.message);
    
    // Try fallback if main failed
    const fallback = config.consumet.fallback || 'mangakakalot';
    if (fallback !== mainProvider) {
      try {
        console.log(`[Ingestion] Trying fallback info: ${fallback}`);
        const res = await client.get(`/manga/${fallback}/info/${mangaId}`);
        const m = res.data;
        const mappedManga = mapMangaFormat(m);
        mappedManga.chapters = (m.chapters || []).map(c => ({
          id: `${fallback}:${c.id}`,
          chapterNumber: c.number || '0',
          title: c.title || `Chapter ${c.number || '0'}`,
          source: fallback
        }));
        return { data: mappedManga };
      } catch (fErr) {
        console.error(`[Ingestion] Fallback info failed (${fallback}):`, fErr.message);
      }
    }
    throw err;
  }
}

async function getChapterPages(chapterId) {
  let mainProvider = provider;
  
  // 🛡️ Source-Aware IDs: "provider:chapter-id"
  if (chapterId.includes(':')) {
    const [p, id] = chapterId.split(':');
    mainProvider = p;
    chapterId = id;
  }

  if (mainProvider === 'mangakatana') {
    const data = await mangakatana.getChapterPages(chapterId);
    return { data };
  }

  try {
    const res = await client.get(`/manga/${mainProvider}/read/${chapterId}`);
    const pages = (res.data || []).map(p => p.img || p.page || p);
    return { data: pages };
  } catch (err) {
    console.error(`[Ingestion] getChapterPages failed (${mainProvider}):`, err.message);
    
    // Try fallback
    const fallback = config.consumet.fallback || 'mangakakalot';
    if (fallback !== mainProvider) {
      try {
        const publicRes = await client.get(`/manga/${fallback}/read/${chapterId}`);
        const pages = (publicRes.data || []).map(p => p.img || p.page || p);
        return { data: pages };
      } catch (fallbackErr) {
        console.error(`[Ingestion] Fallback pages failed (${fallback}):`, fallbackErr.message);
      }
    }
    throw err;
  }
}

async function browseManga(filters) {
  // 🛡️ If a keyword is present, use our fallback-aware searchManga instead of direct browse
  if (filters.keyword && filters.keyword.trim()) {
    return await searchManga(filters.keyword, filters.page || 1);
  }

  if (provider === 'mangakatana') {
    const data = await mangakatana.browseManga(filters);
    // Ensure IDs are prefixed even in browse
    if (data.results) {
      data.results = data.results.map(m => ({ ...m, id: `${provider}:${m.id}` }));
    }
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

