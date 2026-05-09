'use strict';
const axios = require('axios');

/**
 * ALLMANGA SCRAPER (GRAPHQL ENGINE)
 * High-reliability provider for licensed and 18+ content.
 */

const API_URL = 'https://api.allmanga.to/graphql';

async function searchManga(query, page = 1) {
  try {
    const response = await axios.post(API_URL, {
      query: `
        query($search: SearchFilter!, $limit: Int, $page: Int, $translationType: String, $countryOrigin: String) {
          mangas(search: $search, limit: $limit, page: $page, translationType: $translationType, countryOrigin: $countryOrigin) {
            edges {
              node {
                _id
                name
                description
                thumbnail
                status
                genres {
                  name
                }
              }
            }
          }
        }
      `,
      variables: {
        search: {
          keyword: query,
          isManga: true
        },
        limit: 26,
        page: page,
        translationType: 'sub',
        countryOrigin: 'ALL'
      }
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://allmanga.to/',
        'Origin': 'https://allmanga.to'
      },
      timeout: 10000
    });

    const mangas = response.data?.data?.mangas?.edges || [];
    const results = mangas.map(edge => {
      const node = edge.node;
      return {
        id: `allmanga:${node._id}`,
        title: node.name,
        image: node.thumbnail,
        description: node.description || '',
        status: node.status || 'Unknown',
        genres: (node.genres || []).map(g => g.name || g),
        source: 'allmanga'
      };
    });

    return {
      results,
      currentPage: page,
      hasNextPage: results.length >= 26
    };
  } catch (err) {
    // console.error('[AllManga] Search failed:', err.message);
    return { results: [] };
  }
}

async function getMangaInfo(id) {
  try {
    const response = await axios.post(API_URL, {
      query: `
        query ($id: String!) {
          manga(_id: $id) {
            _id
            name
            thumbnail
            description
            genres {
              name
            }
            status
            availableChapters
          }
        }
      `,
      variables: { id }
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://allmanga.to/'
      }
    });

    const manga = response.data?.data?.manga;
    if (!manga) return null;

    const rawChapters = manga.availableChapters?.sub || [];
    const chapters = rawChapters.map(ch => ({
      id: `${id}/chapter-${ch}`,
      title: `Chapter ${ch}`,
      chapterNumber: ch,
      source: 'allmanga'
    })).reverse();

    return {
      id: `allmanga:${manga._id}`,
      title: manga.name,
      description: manga.description,
      image: manga.thumbnail,
      status: manga.status,
      genres: (manga.genres || []).map(g => g.name || g),
      chapters,
      source: 'allmanga'
    };
  } catch (err) {
    console.error(`[AllManga] GetInfo failed for ${id}:`, err.message);
    return null;
  }
}

async function getChapterPages(chapterId) {
  // AllManga pages require specific logic to decrypt/fetch
  return [];
}

module.exports = { searchManga, getMangaInfo, getChapterPages };
