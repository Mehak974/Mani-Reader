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
    const { pages, externalUrl } = await mangaService.getChapterPages(id, mangaId);

    // Tracking moved to progress update (when isRead: true)

    res.json({ 
      pages, 
      total: pages.length, 
      chapterId: id,
      externalUrl 
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
