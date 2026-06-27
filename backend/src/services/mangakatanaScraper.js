'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://mangakatana.com';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': BASE_URL,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
  },
});

/**
 * Search manga on Mangakatana
 */
async function searchManga(query, page = 1) {
  try {
    // 🛡️ Use Homepage Search with correct parameters
    const url = `/`;
    const response = await client.get(url, {
      params: {
        search: query,
        search_by: 'book_name', // ⚡ Corrected parameter
        page: page
      }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Extract total results
    const totalTxt = $('.entry-title').text();
    const totalMatch = totalTxt.match(/\(([^)]+)\)/);
    const totalResults = totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : 0;
    const totalPages = Math.ceil(totalResults / 20) || 1;

    $('#book_list .item').each((i, el) => {
      const titleEl = $(el).find('.title a');
      const href = titleEl.attr('href') || '';
      const id = href.split('/').pop();
      const title = titleEl.text().trim();
      const imgEl = $(el).find('.wrap_img img');
      const image = imgEl.attr('data-src') || imgEl.attr('src');
      const description = $(el).find('.summary').text().trim();
      const status = $(el).find('.status').text().trim();
      const genres = $(el).find('.genres a').map((i, g) => $(g).text().trim()).get();
      
      if (!id || !title) return;

      results.push({
        id,
        title,
        image,
        description,
        status,
        genres,
        source: 'mangakatana'
      });
    });

    return {
      results,
      totalResults: totalResults || results.length,
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
    const image = $('.cover img').attr('src') || $('.cover img').attr('data-src');
    const description = $('.summary p').text().trim();
    const status = $('.item_info .status').text().replace(/Status:/i, '').trim();
    const rating = $('.info .score, .item_info .score').text().trim();
    
    const genres = [];
    $('.info .genres a, .item_info .genres a').each((i, el) => {
      const g = $(el).text().trim();
      if (g && !genres.includes(g)) genres.push(g);
    });

    const chapters = [];
    $('.chapters table tr, .chapters .chapter-row').each((i, el) => {
      const a = $(el).find('.chapter a, a').first();
      if (!a.length) return;

      const chHref = a.attr('href') || '';
      const chId = chHref.split('/').pop();
      const chTitle = a.text().trim();
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
    const response = await client.get(`/manga/${chapterId}`);
    const html = response.data;
    const thzqMatch = html.match(/var\s+thzq\s*=\s*\[(.*?)\];/);
    
    if (!thzqMatch) return [];

    const imagesStr = thzqMatch[1];
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
async function getPopular(page = 1, genre = null) {
  if (genre) {
    return browseManga({ page, order: 5, include: [genre] });
  }
  try {
    const response = await client.get('/');
    const $ = cheerio.load(response.data);
    const results = [];

    // 🛡️ Precision Selector: Target the 'Hot Update' container
    const container = $('#hot_update').length ? $('#hot_update') : $('.slick_book');
    container.find('.item').each((i, el) => {
      const titleEl = $(el).find('.title a');
      const href = titleEl.attr('href') || '';
      const id = href.split('/').pop();
      const title = titleEl.text().trim();
      const imgEl = $(el).find('.wrap_img img');
      const image = imgEl.attr('data-src') || imgEl.attr('src');
      const status = $(el).find('.status').text().trim();
      const updateDate = $(el).find('.date').text().replace(/First Chapter/i, '').trim();
      const genres = $(el).find('.genres a').map((i, g) => $(g).text().trim()).get();
      
      let lastChapterEl = $(el).find('.chapters .chapter a').first();
      if (lastChapterEl.length === 0) lastChapterEl = $(el).find('.last_chap a').first();
      
      const lastChapter = lastChapterEl.text().trim();
      const lastChapterId = lastChapterEl.attr('href')?.replace(/\/$/, '').split('/').pop();

      results.push({
        id,
        title,
        image,
        status,
        genres,
        updateDate,
        lastChapter: lastChapter || null,
        lastChapterId: lastChapterId || null,
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

    // 🛡️ Precision Selector: Target the 'Latest Update' container
    const container = $('#latest_update').length ? $('#latest_update') : $('#book_list');
    container.find('.item').each((i, el) => {
      const titleEl = $(el).find('.title a');
      const href = titleEl.attr('href') || '';
      const id = href.split('/').pop();
      const title = titleEl.text().trim();
      const imgEl = $(el).find('.wrap_img img');
      const image = imgEl.attr('data-src') || imgEl.attr('src');
      const description = $(el).find('.summary').text().trim();
      const status = $(el).find('.status').text().trim();
      const updateDate = $(el).find('.date').text().replace(/First Chapter/i, '').trim();
      const genres = $(el).find('.genres a').map((i, g) => $(g).text().trim()).get();
      
      let lastChapterEl = $(el).find('.chapters .chapter a').first();
      if (lastChapterEl.length === 0) lastChapterEl = $(el).find('.last_chap a').first();
      
      const lastChapter = lastChapterEl.text().trim();
      const lastChapterId = lastChapterEl.attr('href')?.replace(/\/$/, '').split('/').pop();
      
      results.push({
        id,
        title,
        image,
        description,
        status,
        genres,
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
 */
async function browseManga(filters = {}) {
  try {
    const { include = [], exclude = [], status = 0, order = 0, page = 1, keyword = '' } = filters;

    if (keyword && keyword.trim()) {
      return searchManga(keyword, page);
    }

    const toSlug = (g) => g.toLowerCase().replace(/\s+/g, '-');
    const includeStr = include.map(toSlug).join('_');
    const excludeStr = exclude.map(toSlug).join('_');

    const orderMap = { 0: 'latest', 1: 'new', 2: 'top_read', 3: 'az', 4: 'rating', 5: 'hot' };
    const orderStr = orderMap[order] || (order === 'hot' ? 'hot' : 'latest');

    const params = { filter: 1 };
    if (includeStr) params.include = includeStr;
    if (excludeStr) params.exclude = excludeStr;
    if (status > 0) params.status = status;
    if (orderStr) params.order = orderStr;

    // 🏎️ MangaKatana uses path-based pagination for browse: /manga/page/X
    const url = page > 1 ? `/manga/page/${page}` : '/manga';
    const response = await client.get(url, { params });
    const $ = cheerio.load(response.data);
    const results = [];

    // Extract total results: MangaKatana usually has "Manga list (XXXX)" or "Search results (XXXX)"
    let totalResults = 0;
    $('.entry-title, .heading, h1, h2').each((i, el) => {
      const txt = $(el).text();
      const m = txt.match(/\(([\d,.]+)\)/);
      if (m) {
        const num = parseInt(m[1].replace(/[,.]/g, ''));
        if (!isNaN(num) && num > totalResults) totalResults = num;
      }
    });
    
    // Heuristic for total pages
    let totalPages = Math.ceil(totalResults / 20) || 1;
    
    // Fallback: Check pagination numbers for the highest visible page
    $('.page-numbers, .pagination a, .page-link').each((i, el) => {
      const p = parseInt($(el).text().trim());
      if (!isNaN(p) && p > totalPages) totalPages = p;
    });

    // Try to find the "Last" button or the link before "Next"
    const nextBtn = $('a.next, .next-page, .page-numbers.next');
    const lastBtn = $('a.last, .last-page, .page-numbers.last, a:contains("Last"), a:contains(">>")');
    
    if (lastBtn.length > 0) {
      const href = lastBtn.attr('href') || '';
      const m = href.match(/\/page\/(\d+)/) || href.match(/page=(\d+)/);
      if (m) {
        totalPages = Math.max(totalPages, parseInt(m[1]));
      } else {
        const txt = parseInt(lastBtn.text().trim());
        if (!isNaN(txt)) totalPages = Math.max(totalPages, txt);
      }
    } else if (nextBtn.length > 0) {
      // If there is a next but no last, at least there is one more page
      totalPages = Math.max(totalPages, page + 1);
    }

    $('#book_list .item').each((i, el) => {
      const titleEl = $(el).find('.title a');
      const id = (titleEl.attr('href') || '').split('/').pop();
      const title = titleEl.text().trim();
      const imgEl = $(el).find('.wrap_img img');
      const image = imgEl.attr('data-src') || imgEl.attr('src');
      const genres = $(el).find('.genres a').map((i, g) => $(g).text().trim()).get();
      
      if (!id || !title) return;

      // 🏎️ Extract Latest Chapter Info
      let lastChapterEl = $(el).find('.chapters .chapter a').first();
      if (lastChapterEl.length === 0) lastChapterEl = $(el).find('.last_chap a').first();
      
      const lastChapter = lastChapterEl.text().trim();
      const lastChapterId = lastChapterEl.attr('href')?.replace(/\/$/, '').split('/').pop();

      results.push({
        id,
        title,
        image,
        genres,
        lastChapter: lastChapter || null,
        lastChapterId: lastChapterId || null,
        source: 'mangakatana'
      });
    });

    return { results, totalResults, totalPages, currentPage: page, hasNextPage: $('.page-numbers.next').length > 0 };
  } catch (err) {
    console.error('[MangaKatana] browseManga failed:', err.message);
    return { results: [], currentPage: 1, hasNextPage: false };
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
