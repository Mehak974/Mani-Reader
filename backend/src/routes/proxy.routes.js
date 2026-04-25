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

  // Basic SSRF protection — only allow http/https
  if (!decoded.startsWith('http://') && !decoded.startsWith('https://')) {
    return res.status(400).json({ error: 'Only HTTP(S) URLs are allowed' });
  }

  await proxyImage(decoded, res);
});

module.exports = router;
