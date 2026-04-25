'use strict';
const router = require('express').Router();
const userState = require('../services/userStateService');
const { validate, schemas } = require('../middleware/validate');

// Optional auth — pass userId if logged in
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

// POST /api/progress
router.post('/', optionalAuth, validate(schemas.progress), async (req, res) => {
  try {
    const { mangaId, chapterId, page, isRead } = req.body;
    const userId = req.user?.userId || null;
    const guestId = req.headers['x-device-id'] || req.ip || req.connection.remoteAddress;
    const prog = await userState.upsertProgress(userId, mangaId, chapterId, page, isRead, guestId);
    
    // Analytics: Track chapter read
    if (isRead) {
      const analyticsService = require('../services/analyticsService');
      analyticsService.trackChapterRead();
    }

    res.status(201).json(prog);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/progress/:mangaId — all chapter progress for a manga
router.get('/:mangaId', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.json([]);
    const progress = await userState.getProgressForManga(userId, req.params.mangaId);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/progress/:mangaId/last — last read chapter for resume
router.get('/:mangaId/last', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.json(null);
    const last = await userState.getLastProgress(userId, req.params.mangaId);
    res.json(last);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
