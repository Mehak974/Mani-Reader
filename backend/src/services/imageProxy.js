'use strict';
/**
 * IMAGE PROXY SERVICE
 *
 * Streams external manga images through the backend.
 * - Prevents CORS/hotlink blocking on the frontend.
 * - All images on the frontend must go through GET /api/image?url=<encoded>
 */

const axios = require('axios');
const cache = require('./cacheLayer');

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
  try {
    const url = new URL(imageUrl);
    const domain = url.hostname.replace('www.', '');
    
    if (domain.includes('mangadex')) return 'https://mangadex.org';
    if (domain.includes('mangakatana')) return 'https://mangakatana.com/';
    if (domain.includes('manganato')) return 'https://manganato.com';
    if (domain.includes('mangakakalot')) return 'https://mangakakalot.com';
    if (domain.includes('comick')) return 'https://comick.io';
    if (domain.includes('batocomic') || domain.includes('mangatoto') || domain.includes('xbato') || domain.includes('batosi')) return 'https://mangatoto.com';
    
    // Default to the domain of the image itself (often works for WP sites/Imgur)
    return `https://${domain}`;
  } catch {
    return REFERERS.default;
  }
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

  // 🛡️ Security Fix: Domain Whitelist
  // Only allow proxying from trusted manga sources to prevent open proxy abuse
  const ALLOWED_DOMAINS = [
    'mangadex.org', 'mangadex.com', 'mangakakalot.com', 'mangakakalot.tv', 'mangahere.cc', 
    'mangakatana.com', 'manganato.com', 'chapmanganato.com', 'chapmanganato.to', 
    'manganato.to', 'manganato.tv', 'mangaclash.com', 'mangatigre.net', 'mangatigre.com', 
    'asuracomics.com', 'reaperscans.com', 'flamescans.org', 'nhentai.net', 'image.tmdb.org', 
    'placehold.co', 'cloudinary.com', 'wp.com', 'i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'i3.wp.com', 
    'imgur.com', 'blogspot.com', 'googleusercontent.com', 'wp-manga.com', 'manga-swat.com', 
    'manhwa68.com', 'manhuas.net', 'mangafreak.me', 'mangafreak.org', 'mangapanda.com', 
    'mangareader.net', 'readm.org', 'mangabob.com', 'manganelo.com', 'manganelo.tv',
    'comick.app', 'comick.fun', 'comick.io', 'bilibilicomics.com', 'webtoons.com', 'tapas.io',
    'mangago.me', 'mangapark.net', 'mangapark.me', 'mangapill.com', 'mangafirst.jp',
    'manhuascan.com', 'zinmanga.com', 'mangasee123.com', 'manga4life.com', 'mangaowl.net',
    'comick.org', 'mangareader.to', 'mangatoto.com', 'batocomic.com', 'xbato.com', 
    'batosi.lat', 'meo.comick.pictures', 'meo3.comick.pictures'
  ];

  let urlObj;
  try {
    urlObj = new URL(imageUrl);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const isAllowed = ALLOWED_DOMAINS.some(domain => urlObj.hostname.endsWith(domain));

  if (!isAllowed) {
    console.warn(`[ImageProxy] Blocked domain: ${urlObj.hostname}. Consider adding to ALLOWED_DOMAINS if trusted.`);
    // Fallback: If it's a known image extension, we might want to allow it? 
    // For now, still block but log so we can fix.
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: `Domain ${urlObj.hostname} is not whitelisted.` 
    });
  }

  const cacheKey = `img:${imageUrl}`;
  try {
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Cache', 'HIT');
      return res.send(Buffer.from(cached.data, 'base64'));
    }

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        Referer: getReferer(imageUrl),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return res.status(403).json({ error: 'Only images allowed' });
    }

    const buffer = Buffer.from(response.data);
    
    // ⚡ Optimization: Only cache reasonably sized images to save memory
    if (buffer.length < 1024 * 1024) { 
      await cache.set(cacheKey, {
        contentType,
        data: buffer.toString('base64')
      }, 14400); // 4 hour cache
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Cache', 'MISS');
    res.send(buffer);
  } catch (err) {
    console.error('[ImageProxy] Fetch error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to fetch image from source' });
    }
  }
}

module.exports = { proxyImage };

