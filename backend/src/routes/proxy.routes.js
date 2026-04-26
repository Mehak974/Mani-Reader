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

  // 🛡️ Reliability Fix: Use internal proxyImage by default to ensure 100% visibility
  // Redirection to workers often fails due to referrer/domain mismatch on new custom domains
  await proxyImage(decoded, res);
});

module.exports = router;
