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

  // 🛡️ Cloudflare Bandwidth Shield: Redirect to worker if configured
  const config = require('../config/env');
  if (config.imageProxyUrl) {
    return res.redirect(`${config.imageProxyUrl}?url=${encodeURIComponent(decoded)}`);
  }

  await proxyImage(decoded, res);
});

module.exports = router;
