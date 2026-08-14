'use strict';
const axios = require('axios');
const cache = require('./cacheLayer');

const REFERERS = {
  manganato: 'https://www.manganato.gg/',
  mangakakalot: 'https://www.mangakakalot.gg/',
  default: 'https://www.manganato.gg/',
};

const REFERER_MAP = {
  'storage.waitst.com': 'https://www.manganato.gg/',
  'imgs-2.2xstorage.com': 'https://www.manganato.gg/',
  'img-r1.2xstorage.com': 'https://www.manganato.gg/',
  'img-r2.2xstorage.com': 'https://www.manganato.gg/',
  '2xstorage.com': 'https://www.manganato.gg/',
};

function getReferer(imageUrl) {
  if (!imageUrl) return REFERERS.default;
  try {
    const url = new URL(imageUrl);
    const domain = url.hostname.replace('www.', '');
    if (REFERER_MAP[domain]) return REFERER_MAP[domain];
    if (domain.includes('manganato') || domain.includes('mangakakalot')) return REFERERS.manganato;
    return `https://${domain}/`;
  } catch {
    return REFERERS.default;
  }
}

async function proxyImage(imageUrl, res) {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid image URL' });
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

    const headers = {
      Referer: getReferer(imageUrl),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    };

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers,
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return res.status(403).json({ error: 'Only images allowed' });
    }

    const buffer = Buffer.from(response.data);

    if (buffer.length < 1024 * 1024) {
      await cache.set(cacheKey, {
        contentType,
        data: buffer.toString('base64')
      }, 14400);
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
