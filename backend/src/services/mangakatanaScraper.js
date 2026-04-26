'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://mangakatana.com';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Referer': BASE_URL,
  },
});

/**
 * Search manga on Mangakatana
 */
async function searchManga(query, page = 1) {
  try {
    const url = `/`;
    
    const response = await client.get(url, {
      params: {
        search: query,
        search_by: 'm_name',
        page: page
      }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Extract total results: SEARCH RESULTS (6764)
    const totalTxt = $('.entry-title').text();
    const totalMatch = totalTxt.match(/\(([^)]+)\)/);
    const totalResults = totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : 0;
    const totalPages = Math.ceil(totalResults / 20) || 1;

    $('#book_list .item').each((i, el) => {
      const titleEl = $(el).find('.title a');
      const href = titleEl.attr('href') || '';
      const id = href.split('/').pop();
      const title = titleEl.text().trim();
      const image = $(el).find('.wrap_img img').attr('src') || $(el).find('.wrap_img img').attr('data-src');
      const description = $(el).find('.summary').text().trim();
      const status = $(el).find('.status').text().trim();
      
      results.push({
        id,
        title,
        image,
        description,
        status,
        source: 'mangakatana'
      });
    });

    return {
      results,
      totalResults,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages
    };
  } catch (err) {
    console.error('[MangaKatana] Search failed:', err.message);
    return { results: [], currentPage: page, hasNextPage: false };
  }
}

/**
 * Get manga info and chapters
 */
async function getMangaInfo(mangaId) {
  try {
    const response = await client.get(`/manga/${mangaId}`);
    const $ = cheerio.load(response.data);

    const title = $('h1.heading').text().trim();
    const image = $('.cover img').attr('src');
    const description = $('.summary p').text().trim();
    const status = $('.item_info .status').text().replace(/Status:/i, '').trim();
    const rating = $('.info .score, .item_info .score').text().trim();
    
    // Genres - target the specific container within the info block
    const genres = [];
    $('.info .genres a, .item_info .genres a').each((i, el) => {
      const g = $(el).text().trim();
      if (g && !genres.includes(g)) genres.push(g);
    });

    // Fallback if the above fails
    if (genres.length === 0) {
      $('.info li, .item_info li').each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes('Genres:')) {
          $(el).find('a').each((j, a) => {
            const g = $(a).text().trim();
            if (g && !genres.includes(g)) genres.push(g);
          });
        }
      });
    }

    const chapters = [];
    $('.chapters table tr, .chapters .chapter-row').each((i, el) => {
      const a = $(el).find('.chapter a, a').first();
      if (!a.length) return;

      const chHref = a.attr('href') || '';
      const chId = chHref.split('/').pop();
      const chTitle = a.text().trim();
      // Selector from DOM inspection: .update_time
      const chDate = $(el).find('.update_time, .update_at').text().trim();
      
      const chNumberMatch = chTitle.match(/Chapter\s+([\d.]+)/i);
      const chNumber = chNumberMatch ? chNumberMatch[1] : (i + 1).toString();

      chapters.push({
        id: `${mangaId}/${chId}`, 
        chapterNumber: chNumber,
        title: chTitle,
        releasedAt: chDate,
        source: 'mangakatana'
      });
    });

    return {
      id: mangaId,
      title,
      image,
      description,
      status,
      genres,
      rating,
      chapters,
      source: 'mangakatana'
    };
  } catch (err) {
    console.error(`[MangaKatana] GetInfo failed (${mangaId}):`, err.message);
    throw err;
  }
}

/**
 * Get chapter pages
 */
async function getChapterPages(chapterId) {
  try {
    // chapterId is expected to be "manga-slug.id/cXXX"
    const response = await client.get(`/manga/${chapterId}`);
    const html = response.data;
    
    // Extract thzq array from script tags
    // var thzq=['https://...', 'https://...'];
    const thzqMatch = html.match(/var\s+thzq\s*=\s*\[(.*?)\];/);
    
    if (!thzqMatch) {
      console.warn('[MangaKatana] No images found in chapter:', chapterId);
      return [];
    }

    const imagesStr = thzqMatch[1];
    // Simple parse for array of strings
    const pages = imagesStr
      .split(',')
      .map(s => s.trim().replace(/['"]/g, ''))
      .filter(s => s.startsWith('http'));

    return pages;
  } catch (err) {
    console.error(`[MangaKatana] GetPages failed (${chapterId}):`, err.message);
    return [];
  }
}

/**
 * Get popular/trending manga (Hot Updates)
 */
async function getPopular(page = 1) {
  try {
    const response = await client.get('/');
    const $ = cheerio.load(response.data);
    const results = [];

    $('.slick_book .item').each((i, el) => {
      const titleEl = $(el).find('.title a');
      const href = titleEl.attr('href') || '';
      const id = href.split('/').pop();
      const title = titleEl.text().trim();
      const image = $(el).find('.wrap_img img').attr('src');
      const status = $(el).find('.status').text().trim();
      
      results.push({
        id,
        title,
        image,
        status,
        source: 'mangakatana'
      });
    });

    return { results };
  } catch (err) {
    console.error('[MangaKatana] getPopular failed:', err.message);
    return { results: [] };
  }
}

/**
 * Get recent updates
 */
async function getRecent(page = 1) {
  try {
    const response = await client.get(page > 1 ? `/latest/page/${page}` : '/latest');
    const $ = cheerio.load(response.data);
    const results = [];

    $('#book_list .item').each((i, el) => {
      const titleEl = $(el).find('.title a');
      const href = titleEl.attr('href') || '';
      const id = href.split('/').pop();
      const title = titleEl.text().trim();
      const image = $(el).find('.wrap_img img').attr('src');
      const description = $(el).find('.summary').text().trim();
      const status = $(el).find('.status').text().trim();
      const updateDate = $(el).find('.date').text().trim();
      
      let lastChapterEl = $(el).find('.chapters .chapter a').first();
      if (lastChapterEl.length === 0) {
        lastChapterEl = $(el).find('.last_chap a').first();
      }
      const lastChapter = lastChapterEl.text().trim();
      const lastChapterHref = lastChapterEl.attr('href') || '';
      const lastChapterId = lastChapterHref.replace(/\/$/, '').split('/').pop();
      
      results.push({
        id,
        title,
        image,
        description,
        status,
        updateDate,
        lastChapter,
        lastChapterId,
        source: 'mangakatana'
      });
    });

    return { results };
  } catch (err) {
    console.error('[MangaKatana] getRecent failed:', err.message);
    return { results: [] };
  }
}

/**
 * Browse/Filter manga
 * filters: { include: [], exclude: [], status: 0|1|2|3, order: 0|1|2|3, page: 1 }
 * status: 0=All, 1=Ongoing, 2=Completed, 3=Cancelled
 * order:  0=Latest, 1=Newest, 2=Top Read, 3=A-Z, 4=Rating
 */
async function browseManga(filters = {}) {
  try {
    const { include = [], exclude = [], status = 0, order = 0, page = 1, keyword = '', includeMode = 'and', time = '' } = filters;

    // Handle search separately if keyword is provided, then filter manually if needed
    if (keyword && keyword.trim()) {
      const searchRes = await searchManga(keyword, page);
      // If we have genres to filter by, we have to do it manually here
      if (include.length > 0 || exclude.length > 0) {
        searchRes.results = searchRes.results.filter(m => {
          const mGenres = (m.genres || []).map(g => g.toLowerCase());
          const hasInclude = includeMode === 'or' 
            ? include.some(g => mGenres.includes(g.toLowerCase()))
            : include.every(g => mGenres.includes(g.toLowerCase()));
          const hasExclude = exclude.some(g => mGenres.includes(g.toLowerCase()));
          return (include.length === 0 || hasInclude) && !hasExclude;
        });
      }
      return searchRes;
    }

    const toSlug = (g) => g.toLowerCase().replace(/\s+/g, '-');
    const includeStr = include.map(toSlug).join('_');
    const excludeStr = exclude.map(toSlug).join('_');

    const orderMap = {
      0: 'latest',
      1: 'new',
      2: 'top_read',
      3: 'az',
      4: 'rating',
      'views': 'views',
      'popular': 'views'
    };
    const orderStr = orderMap[order] || order;

    const params = { filter: 1 };
    if (includeStr) params.include = includeStr;
    if (excludeStr) params.exclude = excludeStr;
    if (status > 0) params.status = status;
    if (orderStr) params.order = orderStr;
    if (time) params.time = time;

    const url = page > 1 ? `/manga/page/${page}` : '/manga';
    const response = await client.get(url, { params });
    const $ = cheerio.load(response.data);
    const results = [];

    $('#book_list .item').each((i, el) => {
      const titleEl = $(el).find('.title a');
      const href = titleEl.attr('href') || '';
      const id = href.split('/').pop();
      const title = titleEl.text().trim();
      const image = $(el).find('.wrap_img img').attr('src');
      const statusText = $(el).find('.status').text().trim();
      const description = $(el).find('.summary').text().trim();
      const genres = $(el).find('.genres a').map((i, g) => $(g).text().trim()).get();
      const rating = $(el).find('.num, .score, .rate, .rating').first().text().trim();
      let lastChapterEl = $(el).find('.chapters .chapter a').first();
      if (lastChapterEl.length === 0) {
        lastChapterEl = $(el).find('.last_chap a').first();
      }
      
      const lastChapter = lastChapterEl.text().trim();
      const lastChapterHref = lastChapterEl.attr('href') || '';
      // Ensure we get the slug even if there's a trailing slash
      const lastChapterId = lastChapterHref.replace(/\/$/, '').split('/').pop();
      const updateDate = $(el).find('.date').text().trim();
      
      if (!id || !title) return;

      results.push({
        id,
        title,
        image,
        description,
        status: statusText,
        genres,
        rating,
        lastChapter,
        lastChapterId,
        updateDate,
        source: 'mangakatana'
      });
    });

    // Extract total pages
    const pageLinks = $('.page-numbers');
    let totalPages = page;
    pageLinks.each((i, el) => {
      const txt = $(el).text().replace(/,/g, '').trim();
      const num = parseInt(txt);
      if (!isNaN(num) && num > totalPages) {
        totalPages = num;
      }
    });

    // Extract total results
    // If we have exactly one included genre, we can find its count in the sidebar
    let itemsPerPage = 28;
    let totalResults = totalPages * itemsPerPage; // Default estimate
    if (include.length === 1 && !keyword) {
      const genreLabel = include[0].replace(/-/g, ' ');
      // Search sidebar for "Genre Name (Count)"
      $('.uk-list-divider li').each((i, el) => {
        const text = $(el).text().toLowerCase();
        if (text.includes(genreLabel.toLowerCase())) {
          const match = text.match(/\(([\d,]+)\)/);
          if (match) {
            totalResults = parseInt(match[1].replace(/,/g, ''));
            totalPages = Math.ceil(totalResults / itemsPerPage);
          }
        }
      });
    } else if (!keyword) {
       // Using 28 as multiplier for better consistency with user request
    } else {
       // Search already handles totalResults
    }

    return {
      results,
      currentPage: page,
      totalPages,
      totalResults,
      hasNextPage: page < totalPages
    };
  } catch (err) {
    console.error('[MangaKatana] browseManga failed:', err.message);
    return { results: [], currentPage: 1, totalPages: 1, totalResults: 0, hasNextPage: false };
  }
}

module.exports = {
  searchManga,
  getMangaInfo,
  getChapterPages,
  getPopular,
  getRecent,
  browseManga
};
