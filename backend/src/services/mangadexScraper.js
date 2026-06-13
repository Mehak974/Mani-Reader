'use strict';
const axios = require('axios');

const BASE_API_URL = 'https://api.mangadex.org';

async function searchManga(query, page = 1) {
  try {
    const limit = 20;
    const offset = (page - 1) * limit;
    
    const res = await axios.get(`${BASE_API_URL}/manga`, {
      params: {
        title: query,
        limit: limit,
        offset: offset,
        'contentRating[]': ['safe', 'suggestive', 'erotica', 'pornographic'],
        'includes[]': ['cover_art'],
        // 🛡️ Filter Clutter: Exclude doujinshi (tag id: b13b2a14-2d0c-4828-971c-799f2a74c20e)
        'excludedTags[]': ['b13b2a14-2d0c-4828-971c-799f2a74c20e'],
        'excludedTagsMode': 'AND'
      },
      headers: { 'User-Agent': 'ManiReader/1.0.0' }
    });

    const results = res.data.data.map(m => {
      const attributes = m.attributes;
      const title = attributes.title.en || attributes.title[Object.keys(attributes.title)[0]] || 'Unknown';
      
      // Fix: coverArt relationship fileName is inside attributes if included
      const coverArt = m.relationships.find(r => r.type === 'cover_art');
      const fileName = coverArt?.attributes?.fileName || '';
      
      return {
        id: `mangadex:${m.id}`,
        title: title,
        image: fileName ? `https://uploads.mangadex.org/covers/${m.id}/${fileName}.256.jpg` : '',
        description: attributes.description?.en || '',
        status: attributes.status,
        genres: attributes.tags.map(t => t.attributes.name.en),
        nsfw: ['erotica', 'pornographic'].includes(attributes.contentRating),
        source: 'mangadex'
      };
    });

    return {
      results,
      totalResults: res.data.total,
      totalPages: Math.ceil(res.data.total / limit),
      currentPage: page,
      hasNextPage: offset + limit < res.data.total
    };
  } catch (err) {
    console.error('[MangaDex] Search failed:', err.message);
    return { results: [] };
  }
}

async function getMangaInfo(id) {
  try {
    const res = await axios.get(`${BASE_API_URL}/manga/${id}`, {
      params: { 'includes[]': ['cover_art', 'author', 'artist'] }
    });

    const m = res.data.data;
    const attr = m.attributes;
    const title = attr.title.en || attr.title[Object.keys(attr.title)[0]];
    const coverArt = m.relationships.find(r => r.type === 'cover_art');
    const fileName = coverArt?.attributes?.fileName || '';

    // Fetch chapters (limit to 500 for now)
    const chapRes = await axios.get(`${BASE_API_URL}/manga/${id}/feed`, {
      params: {
        limit: 500,
        'translatedLanguage[]': ['en'],
        order: { chapter: 'desc' },
        'contentRating[]': ['safe', 'suggestive', 'erotica', 'pornographic']
      }
    });

    const chapters = chapRes.data.data.map(ch => ({
      id: `mangadex:${ch.id}`,
      title: ch.attributes.title ? `Ch. ${ch.attributes.chapter}: ${ch.attributes.title}` : `Chapter ${ch.attributes.chapter}`,
      chapterNumber: ch.attributes.chapter,
      source: 'mangadex'
    }));

    return {
      id: `mangadex:${m.id}`,
      title,
      description: attr.description.en || '',
      image: fileName ? `https://uploads.mangadex.org/covers/${m.id}/${fileName}` : '',
      status: attr.status,
      genres: attr.tags.map(t => t.attributes.name.en),
      nsfw: ['erotica', 'pornographic'].includes(attr.contentRating),
      chapters,
      source: 'mangadex'
    };
  } catch (err) {
    console.error('[MangaDex] GetInfo failed:', err.message);
    return null;
  }
}

async function getChapterPages(chapterId) {
  try {
    const res = await axios.get(`${BASE_API_URL}/at-home/server/${chapterId}`);
    const { baseUrl, chapter } = res.data;
    const hash = chapter.hash;
    
    return {
      data: chapter.data.map(file => `${baseUrl}/data/${hash}/${file}`),
      externalUrl: `https://mangadex.org/chapter/${chapterId}`
    };
  } catch (err) {
    console.error('[MangaDex] GetPages failed:', err.message);
    return { data: [] };
  }
}

module.exports = { searchManga, getMangaInfo, getChapterPages };
