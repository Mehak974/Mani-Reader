'use strict';
const router = require('express').Router();
const mangaService = require('../services/mangaService');
const prisma = require('../lib/prisma');
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

    // ⚡ Edge Cache: 1 hour for searches
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
    res.json({ results, query: q, page: parseInt(page) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/manga/browse/popular
router.get('/browse/popular', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { genre } = req.query;
    const results = await mangaService.getPopular(page, req.user?.userId, genre);
    // ⚡ Edge Cache: 6 hours for popular
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=59');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/manga/browse/popular-fantasy — from the DB table (lightweight, just metadata)
router.get('/browse/popular-fantasy', optionalAuth, async (req, res) => {
  try {
    const list = await prisma.popularManga.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20
    });
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300');
    res.json(list.map(m => ({
      id: m.id,
      title: m.title,
      image: m.imageUrl,
      mangaDetailLink: m.mangaDetailLink,
      lastChapter: m.latestChapter,
      lastChapterId: m.latestChapterId
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/manga/most-read
router.get('/most-read', optionalAuth, async (req, res) => {
  try {
    const results = await mangaService.getPopularByScore(20, req.user?.userId);
    // ⚡ Edge Cache: 1 hour for most read
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/manga/browse/recent?page= (and alias /latest)
router.get(['/browse/recent', '/browse/latest'], optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const results = await mangaService.getRecent(page, req.user?.userId);
    // ⚡ Edge Cache: 15 mins for latest
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=59');
    res.json({ results, page, totalPages: 500 });
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
    // ⚡ Edge Cache: 10 mins for browse filters only when no keyword is searched and we have results
    if (!filters.keyword && data.results && data.results.length > 0) {
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=59');
    } else {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/manga/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const manga = await mangaService.getMangaInfo(req.params.id, req.user?.userId);
    // ⚡ Edge Cache: 24 hours for manga info (static mostly)
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
    res.json(manga);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/manga/:id/related
router.get('/:id/related', optionalAuth, async (req, res) => {
  try {
    const results = await mangaService.getRelated(req.params.id, req.user?.userId);
    // ⚡ Edge Cache: 1 day for related manga recommendations
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
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
// GET /api/manga/browse/popular-completed
router.get('/browse/popular-completed', optionalAuth, async (req, res) => {
  try {
    const list = await prisma.popularCompletedManga.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300');
    // Map to format similar to other manga cards
    res.json(list.map(m => ({
      id: m.slug,
      title: m.title,
      image: m.imageUrl,
      mangaDetailLink: `/manga/${m.slug}`,
      lastChapter: m.chapters
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
