const axios = require('axios');

/**
 * Fetch top popular manga by genre from AniList GraphQL API
 */
async function getPopularMangaByGenre(genre, limit = 12, page = 1) {
  const query = `
    query ($genre: String, $perPage: Int, $page: Int) {
      Page (page: $page, perPage: $perPage) {
        media (genre: $genre, type: MANGA, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          genres
        }
      }
    }
  `;

  try {
    const response = await axios.post('https://graphql.anilist.co', {
      query,
      variables: {
        genre,
        perPage: limit,
        page
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 5000
    });

    const mediaList = response.data?.data?.Page?.media || [];
    return mediaList.map(m => ({
      anilistId: m.id,
      titles: Array.from(new Set([
        m.title.english,
        m.title.romaji,
        m.title.userPreferred,
        m.title.native
      ].filter(Boolean))),
      genres: m.genres || []
    }));
  } catch (err) {
    console.warn(`[AniList] Failed to fetch popular manga for genre ${genre}:`, err.message);
    return [];
  }
}

async function getTrendingManga(limit = 20) {
  const query = `
    query ($perPage: Int) {
      Page (page: 1, perPage: $perPage) {
        media (type: MANGA, sort: TRENDING_DESC) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          genres
        }
      }
    }
  `;

  try {
    const response = await axios.post('https://graphql.anilist.co', {
      query,
      variables: {
        perPage: limit
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 5000
    });

    const mediaList = response.data?.data?.Page?.media || [];
    return mediaList.map(m => ({
      anilistId: m.id,
      titles: Array.from(new Set([
        m.title.english,
        m.title.romaji,
        m.title.userPreferred,
        m.title.native
      ].filter(Boolean))),
      genres: m.genres || []
    }));
  } catch (err) {
    console.warn('[AniList] Failed to fetch trending manga:', err.message);
    return [];
  }
}

module.exports = {
  getPopularMangaByGenre,
  getTrendingManga
};
