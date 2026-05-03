'use strict';
const axios = require('axios');

const API_BASE = 'https://api.mangadex.org';

async function searchManga(query, page = 1) {
  try {
    const res = await axios.get(`${API_BASE}/manga`, {
      params: {
        title: query,
        limit: 20,
        offset: (page - 1) * 20,
        'contentRating[]': ['safe', 'suggestive', 'erotica', 'pornographic'],
        'includes[]': ['cover_art']
      }
    });

    const results = res.data.data.map(m => {
      const attributes = m.attributes;
      const title = attributes.title.en || attributes.title[Object.keys(attributes.title)[0]] || 'Unknown Title';
      const description = attributes.description.en || '';
      
      const coverArt = (m.relationships || []).find(r => r.type === 'cover_art');
      const coverFileName = coverArt?.attributes?.fileName;
      const image = coverFileName ? `https://uploads.mangadex.org/covers/${m.id}/${coverFileName}` : null;

      return {
        id: m.id,
        title,
        image,
        description,
        status: attributes.status,
        nsfw: ['erotica', 'pornographic'].includes(attributes.contentRating),
        genres: attributes.tags.map(t => t.attributes.name.en),
        source: 'mangadex'
      };
    });

    return { results };
  } catch (err) {
    console.error('[MangaDex] Direct search failed:', err.message);
    return { results: [] };
  }
}

async function getMangaInfo(mangaId) {
  try {
    const res = await axios.get(`${API_BASE}/manga/${mangaId}`, {
      params: { 'includes[]': ['cover_art', 'author', 'artist'] }
    });
    const m = res.data.data;
    const attributes = m.attributes;
    
    // Chapters
    const chRes = await axios.get(`${API_BASE}/manga/${mangaId}/aggregate`, {
      params: { 'translatedLanguage[]': ['en'] }
    });
    
    const chapters = [];
    const volumes = chRes.data.volumes || {};
    Object.values(volumes).forEach(v => {
      Object.values(v.chapters).forEach(c => {
        chapters.push({
          id: c.id, // This is the ID of the first aggregate chapter, might need refinement
          chapterNumber: c.chapter,
          title: `Chapter ${c.chapter}`,
          source: 'mangadex'
        });
      });
    });

    return {
      id: m.id,
      title: attributes.title.en || attributes.title[Object.keys(attributes.title)[0]],
      image: null, // Would need full info fetch for cover
      description: attributes.description.en,
      status: attributes.status,
      genres: attributes.tags.map(t => t.attributes.name.en),
      nsfw: ['erotica', 'pornographic'].includes(attributes.contentRating),
      chapters: chapters.sort((a,b) => parseFloat(b.chapterNumber) - parseFloat(a.chapterNumber)),
      source: 'mangadex'
    };
  } catch (err) {
    console.error('[MangaDex] Direct info failed:', err.message);
    throw err;
  }
}

async function getChapterPages(chapterId) {
  try {
    const res = await axios.get(`${API_BASE}/at-home/server/${chapterId}`);
    const { baseUrl, chapter } = res.data;
    const hash = chapter.hash;
    const pages = chapter.data.map(p => `${baseUrl}/data/${hash}/${p}`);
    return pages;
  } catch (err) {
    console.error('[MangaDex] Get pages failed:', err.message);
    return [];
  }
}

module.exports = { searchManga, getMangaInfo, getChapterPages };
