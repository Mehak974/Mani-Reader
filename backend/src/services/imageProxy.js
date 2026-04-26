'use strict';
/**
 * IMAGE PROXY SERVICE
 *
 * Streams external manga images through the backend.
 * - Prevents CORS/hotlink blocking on the frontend.
 * - All images on the frontend must go through GET /api/image?url=<encoded>
 */

const axios = require('axios');

// Common referer headers used by manga sites
const REFERERS = {
  mangadex: 'https://mangadex.org',
  mangakakalot: 'https://mangakakalot.com',
  mangahere: 'https://www.mangahere.cc',
  mangakatana: 'https://mangakatana.com',
  default: 'https://mangadex.org',
};

function getReferer(imageUrl) {
  if (!imageUrl) return REFERERS.default;
  const url = imageUrl.toLowerCase();
  if (url.includes('mangadex')) return REFERERS.mangadex;
  if (url.includes('mangakakalot')) return REFERERS.mangakakalot;
  if (url.includes('mangahere')) return REFERERS.mangahere;
  if (url.includes('mangakatana')) return 'https://mangakatana.com/'; // Strict trailing slash
  return REFERERS.default;
}

/**
 * Proxy an image URL — pipes the response stream to `res`.
 * @param {string} imageUrl — The external image URL to proxy
 * @param {object} res — Express response object
 */
async function proxyImage(imageUrl, res) {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid image URL' });
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 20000,
      headers: {
        Referer: getReferer(imageUrl),
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h browser cache
    res.setHeader('X-Proxied-By', 'manga-reader-proxy');

    response.data.pipe(res);

    response.data.on('error', (err) => {
      console.error('[ImageProxy] Stream error:', err.message);
      if (!res.headersSent) res.status(502).end();
    });
  } catch (err) {
    console.error('[ImageProxy] Fetch error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to fetch image from source' });
    }
  }
}

module.exports = { proxyImage };
