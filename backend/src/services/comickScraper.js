'use strict';
const axios = require('axios');

/**
 * COMICK.IO SCRAPER (PRIMARY ENGINE)
 * High-speed provider for the latest chapters and images.
 */

const client = axios.create({
  baseURL: 'https://api.comick.io',
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

async function searchManga(query, page = 1) {
  try {
    const res = await client.get('/v1.0/search', {
      params: { q: query, limit: 24, page }
    });

    const results = (res.data || []).map(m => ({
      id: m.slug,
      title: m.title,
      image: m.md_covers?.[0]?.b2key 
        ? `https://meo.comick.pictures/${m.md_covers[0].b2key}`
        : null,
      description: m.desc,
      status: m.status === 1 ? 'Ongoing' : 'Completed',
      lastChapter: m.last_chapter ? `Chapter ${m.last_chapter}` : null,
      rating: m.rating ? (parseFloat(m.rating) / 2).toFixed(1) : null,
      source: 'comick'
    }));

    return { results };
  } catch (err) {
    console.error('[ComickScraper] Search failed:', err.message);
    return { results: [] };
  }
}

async function getPopular(page = 1) {
  try {
    const res = await client.get('/v1.0/search', {
      params: { sort: 'trending', limit: 24, page }
    });

    const results = (res.data || []).map(m => ({
      id: m.slug,
      title: m.title,
      image: m.md_covers?.[0]?.b2key 
        ? `https://meo.comick.pictures/${m.md_covers[0].b2key}`
        : null,
      description: m.desc,
      status: m.status === 1 ? 'Ongoing' : 'Completed',
      lastChapter: m.last_chapter ? `Chapter ${m.last_chapter}` : null,
      rating: m.rating ? (parseFloat(m.rating) / 2).toFixed(1) : null,
      source: 'comick'
    }));

    return { results };
  } catch (err) {
    console.error('[ComickScraper] Popular failed:', err.message);
    return { results: [] };
  }
}

async function getRecent(page = 1) {
  try {
    const res = await client.get('/v1.0/search', {
      params: { sort: 'uploaded', limit: 24, page }
    });

    const results = (res.data || []).map(m => ({
      id: m.slug,
      title: m.title,
      image: m.md_covers?.[0]?.b2key 
        ? `https://meo.comick.pictures/${m.md_covers[0].b2key}`
        : null,
      description: m.desc,
      status: m.status === 1 ? 'Ongoing' : 'Completed',
      lastChapter: m.last_chapter ? `Chapter ${m.last_chapter}` : null,
      rating: m.rating ? (parseFloat(m.rating) / 2).toFixed(1) : null,
      source: 'comick'
    }));

    return { results };
  } catch (err) {
    console.error('[ComickScraper] Recent failed:', err.message);
    return { results: [] };
  }
}

async function getMangaInfo(slug) {
  try {
    const res = await client.get(`/comic/${slug}`);
    const m = res.data.comic;
    
    // Fetch hid for chapter lookups
    const hid = m.hid;

    return {
      id: m.slug,
      hid: hid,
      title: m.title,
      description: m.desc,
      image: m.md_covers?.[0]?.b2key 
        ? `https://meo.comick.pictures/${m.md_covers[0].b2key}`
        : null,
      status: m.status === 1 ? 'Ongoing' : 'Completed',
      genres: (m.md_genres || []).map(g => g.name),
      lastChapter: m.last_chapter ? `Chapter ${m.last_chapter}` : null,
      rating: m.rating ? (parseFloat(m.rating) / 2).toFixed(1) : null,
      source: 'comick'
    };
  } catch (err) {
    console.error(`[ComickScraper] GetInfo failed for ${slug}:`, err.message);
    return null;
  }
}

async function getChapters(hid) {
  try {
    // Comick uses hid (hashed id) for chapter lookups
    const res = await client.get(`/comic/${hid}/chapters`, {
      params: { limit: 1000, lang: 'en' }
    });

    return (res.data.chapters || []).map(c => ({
      id: c.hid,
      title: c.title || `Chapter ${c.chap}`,
      chapterNum: c.chap,
      volumeNum: c.vol,
      createdAt: c.created_at,
      source: 'comick'
    })).sort((a, b) => parseFloat(b.chapterNum) - parseFloat(a.chapterNum));
  } catch (err) {
    console.error(`[ComickScraper] GetChapters failed for ${hid}:`, err.message);
    return [];
  }
}

async function getChapterPages(chapterHid) {
  try {
    const res = await client.get(`/chapter/${chapterHid}`);
    const images = res.data.chapter.md_images || [];
    
    return images.map(img => {
      return `https://meo.comick.pictures/${img.b2key}`;
    });
  } catch (err) {
    console.error(`[ComickScraper] GetPages failed for ${chapterHid}:`, err.message);
    return [];
  }
}

module.exports = { searchManga, getPopular, getRecent, getMangaInfo, getChapters, getChapterPages };
