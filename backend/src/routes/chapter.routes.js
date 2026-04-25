'use strict';
const router = require('express').Router();
const mangaService = require('../services/mangaService');
const config = require('../config/env');

// GET /api/chapters/:mangaId  — NORMALIZED ONLY
router.get('/:mangaId', async (req, res) => {
  try {
    const chapters = await mangaService.getChapters(req.params.mangaId);
    res.json({ chapters, total: chapters.length });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/chapter/:id/pages  — returns proxied page URLs
router.get('/:id(*)/pages', async (req, res) => {
  try {
    const { id } = req.params;
    const { mangaId } = req.query;
    const { pages: rawPages, externalUrl } = await mangaService.getChapterPages(id, mangaId);

    // Rewrite URLs through our image proxy so frontend never hits external directly
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const proxiedPages = rawPages.map(
      (url) => `${baseUrl}/api/image?url=${encodeURIComponent(url)}`
    );

    res.json({ 
      pages: proxiedPages, 
      total: proxiedPages.length, 
      chapterId: id,
      externalUrl 
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
