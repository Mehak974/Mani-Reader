'use strict';
const router = require('express').Router();
const { proxyImage } = require('../services/imageProxy');

router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url query param required' });

  let decoded;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL encoding' });
  }

  await proxyImage(decoded, res);
});

module.exports = router;
