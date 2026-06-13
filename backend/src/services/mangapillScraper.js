'use strict';
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * MANGAPILL SCRAPER (TURBO ENGINE)
 * High-speed provider for the latest chapters. 
 * Reliability: 5/5
 * Speed: 5/5
 */

const client = axios.create({
  baseURL: 'https://mangapill.com',
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  }
});

async function searchManga(query) {
  try {
    const res = await client.get('/search', { params: { q: query } });
    const $ = cheerio.load(res.data);
    const results = [];

    $('.grid div').each((i, el) => {
      const link = $(el).find('a[href^="/manga/"]');
      if (link.length) {
        const id = link.attr('href').replace('/manga/', '');
        const title = link.text().trim() || $(el).find('div.font-bold').text().trim();
        const image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
        
        // ⚡ Turbo Hack: Extract latest chapter from the grid item
        const lastChapEl = $(el).find('a[href^="/chapters/"]').first();
        const lastChapter = lastChapEl.text().trim() || null;
        const lastChapterId = lastChapEl.attr('href')?.replace('/chapters/', '') || null;

        if (title) {
          results.push({
            id,
            title,
            image,
            lastChapter,
            lastChapterId: lastChapterId ? `mangapill:${lastChapterId}` : null,
            source: 'mangapill'
          });
        }
      }
    });

    return { results };
  } catch (err) {
    console.error('[MangaPill] Search failed:', err.message);
    return { results: [] };
  }
}

async function getMangaInfo(id) {
  try {
    const res = await client.get(`/manga/${id}`);
    const $ = cheerio.load(res.data);

    const title = $('h1').text().trim();
    const description = $('p.text-sm').text().trim();
    const image = $('img').attr('data-src') || $('img').attr('src');
    const status = $('div:contains("Status")').next().text().trim();
    
    const chapters = [];
    $('#chapters div.grid a').each((i, el) => {
      const href = $(el).attr('href');
      const chapId = href.replace('/chapters/', '');
      const chapTitle = $(el).text().trim();
      
      chapters.push({
        id: chapId,
        title: chapTitle,
        chapterNumber: chapTitle.match(/Chapter (\d+(\.\d+)?)/)?.[1] || i.toString(),
        source: 'mangapill'
      });
    });

    return {
      id,
      title,
      description,
      image,
      status,
      chapters,
      source: 'mangapill'
    };
  } catch (err) {
    console.error(`[MangaPill] GetInfo failed for ${id}:`, err.message);
    return null;
  }
}

async function getChapterPages(chapterId) {
  try {
    const res = await client.get(`/chapters/${chapterId}`);
    const $ = cheerio.load(res.data);
    const pages = [];

    $('img[data-src]').each((i, el) => {
      pages.push($(el).attr('data-src'));
    });

    return pages;
  } catch (err) {
    console.error(`[MangaPill] GetPages failed for ${chapterId}:`, err.message);
    return [];
  }
}

module.exports = { searchManga, getMangaInfo, getChapterPages };
