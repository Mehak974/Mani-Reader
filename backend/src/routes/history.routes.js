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

// POST /api/history
router.post('/', optionalAuth, validate(schemas.history), async (req, res) => {
  try {
    const { mangaId, chapterId, page } = req.body;
    const userId = req.user?.userId || null;
    const entry = await userState.addHistory(userId, mangaId, chapterId, page);
    res.status(201).json(entry);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/history?skip=0&take=50
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.json([]);
    const skip = parseInt(req.query.skip || '0');
    const take = parseInt(req.query.take || '50');
    const history = await userState.getHistory(userId, skip, take);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/history — clear all history
router.delete('/', async (req, res) => {
  try {
    await userState.clearHistory(req.user.userId);
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
