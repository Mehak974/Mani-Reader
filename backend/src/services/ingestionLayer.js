'use strict';
const extractor = require('../../extractors/universalExtractor');
const { SOURCE_SCRAPERS } = extractor;

const provider = 'manganato';

function mapMangaFormat(m) {
  const genres = Array.isArray(m.genres) ? m.genres : [];
  const latestChapters = [];
  if (m.chapterHref && m.chapter) {
    latestChapters.push({
      id: m.chapterHref,
      title: m.chapter,
      time: m.date || 'Just now',
    });
  }
  return {
    id: m.href ? m.href.replace(/\/$/, '') : m.id,
    title: m.title || 'Unknown Title',
    image: m.cover || null,
    description: m.description || null,
    status: m.status || 'Unknown',
    nsfw: false,
    genres,
    lastChapter: m.chapter || null,
    lastChapterId: m.chapterHref || null,
    latestChapters,
    updateDate: m.date || null,
    source: provider,
  };
}

function mapMangaDetail(data) {
  return {
    id: data.href || data.id,
    title: data.title || 'Unknown Title',
    image: data.cover || null,
    description: data.description || null,
    status: data.status || 'Unknown',
    nsfw: false,
    genres: Array.isArray(data.genres) ? data.genres : [],
    lastChapter: null,
    lastChapterId: null,
    latestChapters: [],
    updateDate: null,
    source: provider,
    chapters: Array.isArray(data.chapters) ? data.chapters : [],
  };
}

function mapChapter(ch, mangaId) {
  return {
    id: ch.href ? ch.href.replace(/\/$/, '') : ch.id,
    chapterNumber: parseFloat((ch.title || '').match(/(\d+(\.\d+)?)/)?.[1] || '0'),
    title: ch.title || null,
    pages: [],
    releasedAt: ch.date || null,
    source: provider,
    mangaId,
  };
}

async function searchManga(query, page = 1) {
  const scraper = SOURCE_SCRAPERS[provider];
  if (!scraper) return { data: { results: [], totalResults: 0, totalPages: 1, currentPage: page, hasNextPage: false } };

  try {
    const home = await scraper.getHome();
    const items = home.items || [];
    const queryLower = query.toLowerCase().trim();
    const results = items
      .filter(item => item.title.toLowerCase().includes(queryLower))
      .slice(0, 20)
      .map(item => ({
        ...mapMangaFormat(item),
        searchScore: item.title.toLowerCase().includes(queryLower) ? 100 : 0,
      }));

    return {
      data: {
        results,
        totalResults: results.length,
        totalPages: 1,
        currentPage: page,
        hasNextPage: false,
      }
    };
  } catch (err) {
    console.error('[Ingestion] manganato search failed:', err.message);
    return { data: { results: [], totalResults: 0, totalPages: 1, currentPage: page, hasNextPage: false } };
  }
}

const BASE_URL = 'https://www.manganato.gg';

function toMangaUrl(mangaId) {
  if (!mangaId) return null;
  if (mangaId.startsWith('http')) return mangaId;
  return `${BASE_URL}/manga/${mangaId}`;
}

function toChapterUrl(chapterId) {
  if (!chapterId) return null;
  if (chapterId.startsWith('http')) return chapterId;
  return `${BASE_URL}${chapterId.startsWith('/') ? '' : '/'}${chapterId}`;
}

async function getMangaInfo(mangaId) {
  const scraper = SOURCE_SCRAPERS[provider];
  if (!scraper) return { data: {} };

  try {
    const url = toMangaUrl(mangaId);
    if (!url) return { data: {} };
    const detail = await scraper.getMangaDetail(url);
    const mapped = mapMangaDetail(detail);
    mapped.lastChapter = detail.chapters?.[0]?.title || null;
    mapped.lastChapterId = detail.chapters?.[0]?.href || null;
    mapped.latestChapters = (detail.chapters || []).slice(0, 10).map(ch => ({
      id: ch.href,
      title: ch.title,
      time: ch.date,
    }));
    return { data: mapped };
  } catch (err) {
    console.error('[Ingestion] manganato getMangaInfo failed:', err.message);
    return { data: {} };
  }
}

async function getChapterPages(chapterId) {
  const scraper = SOURCE_SCRAPERS[provider];
  if (!scraper) return { data: { pages: [] } };

  try {
    const url = toChapterUrl(chapterId);
    if (!url) return { data: { pages: [] } };
    const result = await scraper.getChapterImages(url);
    return { data: { pages: result.images || [] } };
  } catch (err) {
    console.error('[Ingestion] manganato getChapterPages failed:', err.message);
    return { data: { pages: [] } };
  }
}

async function getPopular(page = 1, genre = null) {
  const scraper = SOURCE_SCRAPERS[provider];
  if (!scraper) return { data: { results: [] } };

  try {
    const home = await scraper.getHome();
    const results = (home.items || []).map(mapMangaFormat);
    return { data: { ...home, results } };
  } catch (err) {
    console.error('[Ingestion] manganato getPopular failed:', err.message);
    return { data: { results: [] } };
  }
}

async function getRecent(page = 1) {
  const scraper = SOURCE_SCRAPERS[provider];
  if (!scraper) return { data: { results: [] } };

  try {
    const home = await scraper.getHome();
    const results = (home.items || []).map(mapMangaFormat);
    return { data: { results } };
  } catch (err) {
    console.error('[Ingestion] manganato getRecent failed:', err.message);
    return { data: { results: [] } };
  }
}

async function browseManga(filters) {
  if (filters.keyword || filters.q) {
    return searchManga(filters.keyword || filters.q, filters.page || 1);
  }

  const scraper = SOURCE_SCRAPERS[provider];
  if (!scraper) return { data: { results: [] } };

  try {
    if (filters.include && filters.include.length > 0) {
      const genre = filters.include[0];
      const { items } = await scraper.getGenrePage(`https://www.manganato.gg/genre/${encodeURIComponent(genre)}?filter=4`);
      const results = items.map(mapMangaFormat);
      return { data: { results } };
    }

    const home = await scraper.getHome();
    const results = (home.items || []).map(mapMangaFormat);
    return { data: { ...home, results } };
  } catch (err) {
    console.error('[Ingestion] manganato browseManga failed:', err.message);
    return { data: { results: [] } };
  }
}

module.exports = {
  searchManga,
  getMangaInfo,
  getChapterPages,
  getRecent,
  getPopular,
  browseManga,
  provider,
};
