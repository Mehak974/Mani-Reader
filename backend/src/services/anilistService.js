const axios = require('axios');
const MAL_GENRE_MAP = {
  action: 1,
  adventure: 2,
  comedy: 4,
  drama: 8,
  fantasy: 10,
  romance: 22,
  sci_fi: 24,
  slice_of_life: 36,
  supernatural: 37,
  mystery: 7,
  sports: 30,
  suspense: 41,
  horror: 14,
  thriller: 45
};

async function getPopularMangaByGenreFromMAL(genre, limit = 12, page = 1) {
  try {
    const cheerio = require('cheerio');
    const genreId = MAL_GENRE_MAP[genre.toLowerCase()];
    if (!genreId) return [];

    const showOffset = (page - 1) * 50;
    const url = `https://myanimelist.net/manga.php?genre[]=${genreId}&show=${showOffset}`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);
    const results = [];
    const seen = new Set();
    
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      const match = href.match(/\/manga\/(\d+)\/([^\/?#]+)/);
      if (match && text) {
        const id = match[1];
        if (!seen.has(id)) {
          seen.add(id);
          // Standardize alternative titles by parsing slug
          const slugTitle = match[2].replace(/_/g, ' ');
          results.push({
            anilistId: null,
            titles: Array.from(new Set([text, slugTitle].filter(Boolean))),
            genres: [genre]
          });
        }
      }
    });
    return results.slice(0, limit);
  } catch (err) {
    console.warn(`[MAL popular fallback] Failed to fetch popular manga for ${genre}:`, err.message);
    return [];
  }
}

async function getTrendingMangaFromMAL(limit = 20) {
  try {
    const cheerio = require('cheerio');
    const res = await axios.get('https://myanimelist.net/topmanga.php?type=manga', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);
    const results = [];
    const seen = new Set();
    
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      const match = href.match(/\/manga\/(\d+)\/([^\/?#]+)/);
      if (match && text) {
        const id = match[1];
        if (!seen.has(id)) {
          seen.add(id);
          const slugTitle = match[2].replace(/_/g, ' ');
          results.push({
            anilistId: null,
            titles: Array.from(new Set([text, slugTitle].filter(Boolean))),
            genres: []
          });
        }
      }
    });
    return results.slice(0, limit);
  } catch (err) {
    console.warn('[MAL popular fallback] Failed to fetch trending manga:', err.message);
    return [];
  }
}

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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
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
    return getPopularMangaByGenreFromMAL(genre, limit, page);
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
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
    return getTrendingMangaFromMAL(limit);
  }
}

async function fetchMangaMetadata(title) {
  const query = `
    query ($search: String) {
      Media (search: $search, type: MANGA) {
        id
        title {
          romaji
          english
          native
          userPreferred
        }
        description
        coverImage {
          extraLarge
          large
          medium
        }
        bannerImage
        genres
        averageScore
        status
      }
    }
  `;

  try {
    const response = await axios.post('https://graphql.anilist.co', {
      query,
      variables: { search: title }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });

    return response.data?.data?.Media || null;
  } catch (err) {
    console.warn(`[AniList] Failed to fetch metadata for title "${title}":`, err.message);
    return null;
  }
}

module.exports = {
  getPopularMangaByGenre,
  getTrendingManga,
  fetchMangaMetadata
};

