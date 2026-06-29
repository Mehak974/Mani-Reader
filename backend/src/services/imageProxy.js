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

  // 🛡️ Security: Blocklist approach — block internal/private network ranges only.
  // Using a blocklist (not allowlist) means ANY new manga cover source works
  // in production without manual domain additions. SSRF is still prevented.
  const BLOCKED_PATTERNS = [
    'localhost', '127.0.0.1', '0.0.0.0', '::1',
    '169.254.',                  // AWS/GCP metadata service
    '10.',                       // RFC-1918 private range
    '192.168.',                  // RFC-1918 private range
    '172.16.',                   // RFC-1918 private range
    'metadata.google.internal',  // GCP metadata
    'manireader.online',         // prevent SSRF back to ourselves
    'api.manireader.online',
  ];

  let urlObj;
  try {
    urlObj = new URL(imageUrl);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only http/https URLs are supported' });
  }

  const host = urlObj.hostname;
  const isBlocked = BLOCKED_PATTERNS.some(p => host === p || host.startsWith(p) || host.includes(p));

  if (isBlocked) {
    console.warn(`[ImageProxy] Blocked SSRF attempt to: ${host}`);
    return res.status(403).json({ error: 'Forbidden', message: 'Private or internal domains are not allowed.' });
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