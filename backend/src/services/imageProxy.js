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
const dns = require('dns').promises;
const net = require('net');

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

// ── SSRF Protection — CIDR-based IP validation (Fix #7) ──────────────────────
//
// The old string-prefix approach missed:
//   • 172.17–172.31 (Docker/private — only '172.16.' was blocked before)
//   • IPv6 private ranges fc00::/7 and ::1 in bracket notation like [::1]
//
// We resolve the hostname to its actual IP(s) at request time and check every
// address against private/reserved CIDR blocks. This also defeats DNS rebinding.

// Private / reserved IPv4 CIDR blocks
const PRIVATE_CIDR_V4 = [
  { base: '127.0.0.0',    bits: 8  },  // loopback
  { base: '10.0.0.0',     bits: 8  },  // RFC-1918
  { base: '172.16.0.0',   bits: 12 },  // RFC-1918 — covers 172.16–172.31
  { base: '192.168.0.0',  bits: 16 },  // RFC-1918
  { base: '169.254.0.0',  bits: 16 },  // link-local / AWS & GCP metadata
  { base: '0.0.0.0',      bits: 8  },  // unspecified
  { base: '100.64.0.0',   bits: 10 },  // shared address space (RFC-6598)
  { base: '192.0.2.0',    bits: 24 },  // TEST-NET-1
  { base: '198.51.100.0', bits: 24 },  // TEST-NET-2
  { base: '203.0.113.0',  bits: 24 },  // TEST-NET-3
];

function ipToLong(ip) {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

function isPrivateV4(ip) {
  if (!net.isIPv4(ip)) return false;
  const ipLong = ipToLong(ip);
  return PRIVATE_CIDR_V4.some(({ base, bits }) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (ipLong & mask) === (ipToLong(base) & mask);
  });
}

function isPrivateV6(ip) {
  if (!net.isIPv6(ip)) return false;
  const n = ip.toLowerCase();
  if (n === '::1') return true;                 // loopback
  if (/^f[cd]/i.test(n)) return true;           // fc00::/7 unique-local (fc** + fd**)
  if (/^fe[89ab]/i.test(n)) return true;        // fe80::/10 link-local
  if (n.startsWith('::ffff:')) {                // IPv4-mapped
    const v4 = n.slice(7);
    if (net.isIPv4(v4)) return isPrivateV4(v4);
  }
  return false;
}

const BLOCKED_HOSTS = new Set([
  'localhost',
  'metadata.google.internal',
  'manireader.online',
  'api.manireader.online',
]);

async function isBlockedUrl(urlObj) {
  const host = urlObj.hostname;

  // 1. Block known internal hostnames
  if (BLOCKED_HOSTS.has(host)) return true;

  // 2. If the hostname is already a raw IP (or [IPv6] bracket form), check it directly
  const rawIp = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
  if (net.isIPv4(rawIp)) return isPrivateV4(rawIp);
  if (net.isIPv6(rawIp)) return isPrivateV6(rawIp);

  // 3. Resolve hostname → IPs and check every address (fail-closed on DNS error)
  try {
    const results = await dns.lookup(host, { all: true, family: 0 });
    for (const { address, family } of results) {
      if (family === 4 && isPrivateV4(address)) return true;
      if (family === 6 && isPrivateV6(address)) return true;
    }
  } catch {
    // DNS failed — block it
    return true;
  }

  return false;
}

// ── Proxy handler ─────────────────────────────────────────────────────────────

/**
 * Proxy an image URL — pipes the response stream to `res`.
 * @param {string} imageUrl — The external image URL to proxy
 * @param {object} res — Express response object
 */
async function proxyImage(imageUrl, res) {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid image URL' });
  }

  let urlObj;
  try {
    urlObj = new URL(imageUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only http/https URLs are supported' });
  }

  // SSRF check — resolves DNS and validates against private CIDR ranges
  if (await isBlockedUrl(urlObj)) {
    console.warn(`[ImageProxy] Blocked SSRF attempt to: ${urlObj.hostname}`);
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

    let response;
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts) {
      try {
        const headers = {
          Referer: getReferer(imageUrl),
        };
        if (!imageUrl.includes('mangadex')) {
          headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
        } else {
          headers['User-Agent'] = 'ManiReader/1.0.0';
        }

        response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
          headers,
        });
        break;
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) throw err;
        await new Promise(r => setTimeout(r, 500));
      }
    }

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