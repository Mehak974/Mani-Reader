'use strict';
const router = require('express').Router();
const mangaService = require('../services/mangaService');
const { searchLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/auth');

// Optional auth — pass userId for NSFW filtering if logged in
function optionalAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.slice(7);
  if (!token) return next();
  try {
    const jwt = require('jsonwebtoken');
    const { jwt: jwtConfig } = require('../config/env');
    req.user = jwt.verify(token, jwtConfig.secret);
  } catch { /* ignore */ }
  next();
}

// GET /api/search?q=&page=
router.get('/', searchLimiter, optionalAuth, async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q || q.trim().length < 1) return res.status(400).json({ error: 'Query is required' });
    const results = await mangaService.search(q.trim(), parseInt(page), req.user?.userId);

    // Track analytics
    if (q.trim()) {
      mangaService.trackSearch(q.trim());
    }

    res.json({ results, query: q, page: parseInt(page) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/manga/browse/popular
router.get('/browse/popular', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const results = await mangaService.getPopular(page, req.user?.userId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/manga/most-read
router.get('/most-read', optionalAuth, async (req, res) => {
  try {
    const results = await mangaService.getPopularByScore(20, req.user?.userId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/manga/browse/recent?page=
router.get('/browse/recent', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const results = await mangaService.getRecent(page, req.user?.userId);
    res.json({ results, page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/manga/browse/filter
router.get('/browse/filter', optionalAuth, async (req, res) => {
  try {
    const { include, exclude, status, order, page = 1, keyword, q, include_mode } = req.query;
    const filters = {
      include: include ? include.split(',').filter(Boolean) : [],
      exclude: exclude ? exclude.split(',').filter(Boolean) : [],
      status: parseInt(status || '0'),
      order: isNaN(order) ? order : parseInt(order || '0'),
      page: parseInt(page),
      keyword: keyword || q || '',
      includeMode: include_mode || 'and'
    };
    const data = await mangaService.browse(filters, req.user?.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/manga/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const manga = await mangaService.getMangaInfo(req.params.id, req.user?.userId);
    res.json(manga);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/manga/:id/related
router.get('/:id/related', optionalAuth, async (req, res) => {
  try {
    const results = await mangaService.getRelated(req.params.id, req.user?.userId);
    res.json(results);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/manga/:id/rate
router.post('/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { score } = req.body;
    if (!score || score < 1 || score > 5) return res.status(400).json({ error: 'Score must be between 1 and 5' });
    const result = await mangaService.rateManga(req.user.userId, req.params.id, score);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
