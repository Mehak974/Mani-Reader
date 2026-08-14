/**
 * Universal Manga Extractor
 * Single-source: Manganato / Mangakakalot
 * Supports proper Referer spoofing and proxy rotation
 */

const axios = require('axios');
const cheerio = require('cheerio');

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Connection': 'keep-alive',
};

const PROXY_URL = process.env.SCRAPER_PROXY_URL || null;
const PROXY_ROTATION = process.env.SCRAPER_PROXY_ROTATION === 'true';
const PROXY_LIST = process.env.SCRAPER_PROXY_LIST ? JSON.parse(process.env.SCRAPER_PROXY_LIST) : [];
let proxyIndex = 0;

function parseProxy(url) {
  if (!url) return null;
  if (typeof url === 'object' && url.host) return url;
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || (parsed.protocol === 'https:' ? '443' : '80'), 10),
      protocol: parsed.protocol.replace(':', '') || 'http',
    };
  } catch {
    return null;
  }
}

function getProxy() {
  if (PROXY_ROTATION && PROXY_LIST.length > 0) {
    const proxy = PROXY_LIST[proxyIndex % PROXY_LIST.length];
    proxyIndex++;
    return parseProxy(proxy);
  }
  return parseProxy(PROXY_URL);
}

const http = axios.create({
  headers: {
    ...BROWSER_HEADERS,
  },
  timeout: 15000,
  maxRedirects: 5,
  proxy: getProxy(),
});

const REFERERS = {
  'manganato.gg': 'https://www.manganato.gg/',
  'mangakakalot.gg': 'https://www.mangakakalot.gg/',
};

function resolveDomain(baseUrl) {
  try {
    const hostname = new URL(baseUrl).hostname;
    return REFERERS[hostname] || `https://${hostname}/`;
  } catch {
    return 'https://www.manganato.gg/';
  }
}

async function fetchHTML(url, extraHeaders = {}) {
  const referer = resolveDomain(url);

  const response = await http.get(url, {
    headers: {
      ...BROWSER_HEADERS,
      Referer: referer,
      ...extraHeaders,
    },
    timeout: 15000,
    maxRedirects: 5,
    proxy: getProxy(),
  });

  return response.data;
}

const SOURCE_SCRAPERS = {
  manganato: {
    id: 'manganato',
    name: 'MangaKakalot',
    baseUrl: 'https://www.manganato.gg',
    color: '#27ae60',

    async getHome() {
      try {
        const html = await fetchHTML('https://www.manganato.gg/');
        const $ = cheerio.load(html);
        const items = [];

        $('.item').each((_, el) => {
          const $el = $(el);
          const $a = $el.find('a[href*="/manga/"]').first();
          if (!$a.length) return;
          const href = $a.attr('href') || '';
          const title = $a.attr('title') || $a.text().trim() || '';
          const cover = $el.find('img').attr('src') || '';
          const chapterLink = $el.find('.slide-caption a').not('.slide-caption h3 a').first();
          const chapter = chapterLink.text().trim() || '';
          const chapterHref = chapterLink.attr('href') || '';
          if (title && href && href.includes('/manga/')) {
            items.push({ title, href: toAbsolute(href, 'https://www.manganato.gg'), cover, chapter, chapterHref: toAbsolute(chapterHref, 'https://www.manganato.gg') });
          }
        });

        if (items.length === 0) {
          $('.update_item, .xem-nhieu-item, .owl-item').each((_, el) => {
            const $el = $(el);
            const $a = $el.find('a[href*="/manga/"]').first();
            if (!$a.length) return;
            const href = $a.attr('href') || '';
            const title = $a.attr('title') || $a.text().trim() || '';
            const cover = $el.find('img').attr('data-src') || $el.find('img').attr('src') || '';
            const chapter = $el.find('.chapter').first().text().trim() || '';
            if (title && href && href.includes('/manga/')) {
              items.push({ title, href: toAbsolute(href, 'https://www.manganato.gg'), cover, chapter });
            }
          });
        }

        return { section: 'Latest Updates', items: dedupByHref(items).slice(0, 20) };
      } catch (err) {
        console.warn('[manganato] getHome failed:', err.message);
        return { section: 'Latest Updates', items: [] };
      }
    },

    async getMangaDetail(url) {
      try {
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);
        const title = $('h1').first().text().trim();
        const cover = $('.summary_image img, .manga-info-pic img, .cover img').first().attr('data-src') ||
                      $('.summary_image img, .manga-info-pic img, .cover img').first().attr('src') || '';
        const description = $('#contentBox').text().trim() ||
                            $('.summary__content p, .description p, .entry-content p').first().text().trim() ||
                            $('.summary__content, .description').first().text().trim();
        const status = $('.post-status .summary-content, .status, .manga-status').last().text().trim() || '';
        const genres = [];
        const NON_GENRE_LINKS = new Set(['All', 'Completed', 'Ongoing', 'Status', 'Author', 'Type']);
        $('.genres-content a, .genre a, .mgen a').each((_, el) => genres.push($(el).text().trim()));
        
        if (genres.length === 0) {
          $('.bordertop').each((_, el) => {
            const text = $(el).text().trim();
            if (text && !text.includes('Status') && !text.includes('Author:') && text.length < 500) {
              $(el).find('a').each((_, a) => {
                const genre = $(a).text().trim();
                if (genre && !NON_GENRE_LINKS.has(genre) && !genres.includes(genre)) genres.push(genre);
              });
            }
          });
        }
        
        if (genres.length === 0) {
          $('tr').each((_, el) => {
            const text = $(el).text().trim();
            if (text.includes('Genre') || text.includes('genres')) {
              $(el).find('a').each((_, a) => {
                const genre = $(a).text().trim();
                if (genre && !NON_GENRE_LINKS.has(genre) && !genres.includes(genre)) genres.push(genre);
              });
            }
          });
        }
        
        const chapters = [];
        try {
          const slug = url.replace('https://www.manganato.gg/manga/', '').replace(/\/$/, '');
          if (slug) {
            let offset = 0;
            const limit = 50;
            let hasMore = true;
            
            while (hasMore) {
              const apiUrl = `https://www.manganato.gg/api/manga/${encodeURIComponent(slug)}/chapters?limit=${limit}&offset=${offset}`;
              const apiRes = await fetchHTML(apiUrl, {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest'
              });
              const apiData = typeof apiRes === 'string' ? JSON.parse(apiRes) : apiRes;
              if (apiData.success && apiData.data?.chapters) {
                for (const ch of apiData.data.chapters) {
                  chapters.push({
                    title: ch.chapter_name,
                    href: `https://www.manganato.gg/manga/${slug}/${ch.chapter_slug}`,
                    date: ch.updated_at ? new Date(ch.updated_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '') : null
                  });
                }
                hasMore = apiData.data.pagination?.has_more === true;
                offset += limit;
              } else {
                hasMore = false;
              }
            }
          }
        } catch (apiErr) {
          console.warn('[manganato] API chapter fetch failed, falling back to DOM:', apiErr.message);
          $('a[href*="chapter-"]').each((_, el) => {
            const href = $(el).attr('href') || '';
            const chTitle = $(el).text().replace(/\s+/g, ' ').trim();
            if (href && href.includes('/manga/') && chTitle && !chapters.some(c => c.href === href)) {
              chapters.push({ title: chTitle, href: toAbsolute(href, 'https://www.manganato.gg') });
            }
          });
        }

        return { title, cover, description, status, genres, chapters: dedupByHref(chapters) };
      } catch (err) {
        console.warn('[manganato] getMangaDetail failed:', err.message);
        return { title: '', cover: '', description: '', status: '', genres: [], chapters: [] };
      }
    },

    async getChapterImages(url) {
      try {
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);
        
        const scriptMatch = html.match(/window\.chapterImages\s*=\s*(\[.*?\]);/s);
        if (scriptMatch) {
          try {
            const parsed = JSON.parse(scriptMatch[1]);
            const cdnMatch = html.match(/var\s+cdns\s*=\s*\["([^"]+)"/);
            const cdnBase = cdnMatch ? cdnMatch[1] : 'https://img-r1.2xstorage.com/';
            const images = parsed
              .map(img => img.replace(/\\\//g, '/').replace(/^\/+/, ''))
              .filter(img => img && !img.includes('data:'))
              .map(img => cdnBase + img);
            if (images.length > 0) return { images, source: 'manganato' };
          } catch (e) {
            console.log('[manganato] Failed to parse chapterImages JSON');
          }
        }
        
        const images = [];
        $('.container-chapter-reader img').each((_, el) => {
          const src = $(el).attr('data-src') || $(el).attr('src') || '';
          if (src && isValidImageUrl(src)) images.push(src.trim());
        });
        
        if (images.length === 0) {
          $('img').each((_, el) => {
            const src = $(el).attr('data-src') || $(el).attr('src') || '';
            if (src && /\/manga\/|\/chapter\/|\/uploads\//.test(src) && isValidImageUrl(src)) {
              images.push(src.trim());
            }
          });
        }
        
        return { images: dedupByHref(images), source: 'manganato' };
      } catch (err) {
        console.warn('[manganato] getChapterImages failed:', err.message);
        return { images: [], source: 'manganato' };
      }
    },

    async getGenrePage(url) {
      try {
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);
        const items = [];

        $('div.list-comic-item-wrap').each((_, el) => {
          const $el = $(el);
          const $a = $el.find('a[href*="/manga/"]').first();
          if (!$a.length) return;
          const href = $a.attr('href') || '';
          const title = $a.attr('title') || $a.text().trim() || '';
          const cover = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
          const chapter = $el.find('.chapter').first().text().trim() || '';
          if (title && href && href.includes('/manga/')) {
            items.push({ title, href: toAbsolute(href, 'https://www.manganato.gg'), cover, chapter });
          }
        });

        return { items: dedupByHref(items).slice(0, 20) };
      } catch (err) {
        console.warn('[manganato] getGenrePage failed:', err.message);
        return { items: [] };
      }
    }
  }
};

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (clean.startsWith('data:') || /\.svg(\?|$)/i.test(clean)) return false;
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(clean) ||
    (clean.startsWith('https://') && clean.length > 30 && !clean.includes(' ') && !clean.includes('.svg'));
}

function toAbsolute(href, base) {
  if (!href) return '';
  if (href.startsWith('http')) return href;
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function dedupByHref(items) {
  const seen = new Set();
  return items.filter(item => {
    const href = typeof item === 'string' ? item : (item.href || '');
    if (!href || seen.has(href)) return false;
    seen.add(href);
    return true;
  });
}

module.exports = { SOURCE_SCRAPERS, fetchHTML };
