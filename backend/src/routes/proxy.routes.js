'use strict';
const router = require('express').Router();
const { proxyImage } = require('../services/imageProxy');

// GET /api/image?url=<encoded>
router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url query param required' });

  let decoded;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL encoding' });
  }

  // Safe domains that allow direct hotlinking without proxying
  const SAFE_DOMAINS = [
    'image.tmdb.org',
    'imgur.com',
    'blogspot.com',
    'googleusercontent.com',
    'placehold.co',
    'wp.com',
    'i0.wp.com',
    'i1.wp.com',
    'i2.wp.com',
    'i3.wp.com'
  ];

  try {
    const parsed = new URL(decoded);
    const host = parsed.hostname;
    const isSafe = SAFE_DOMAINS.some(d => host === d || host.endsWith('.' + d));
    if (isSafe) {
      // Redirect browser directly to the image source to completely bypass our server proxy
      return res.redirect(302, decoded);
    }
  } catch (e) {
    // fallback to proxying
  }

  // 🛡️ Reliability Fix: Use internal proxyImage by default to ensure 100% visibility
  // Redirection to workers often fails due to referrer/domain mismatch on new custom domains
  await proxyImage(decoded, res);
});

module.exports = router;
