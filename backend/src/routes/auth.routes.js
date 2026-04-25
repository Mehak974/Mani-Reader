'use strict';
const router = require('express').Router();
const authService = require('../services/authService');
const { validate, schemas } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', authLimiter, validate(schemas.register), async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);
    res.cookie('token', result.accessToken, { httpOnly: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', result.refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ user: result.user, accessToken: result.accessToken });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie('token', result.accessToken, { httpOnly: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', result.refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: result.user, accessToken: result.accessToken });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(400).json({ error: 'Refresh token required' });
    const result = await authService.refresh(token);
    res.cookie('token', result.accessToken, { httpOnly: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

const prisma = require('../lib/prisma');

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { 
        id: true, email: true, role: true, isVip: true, nsfw: true, 
        adsWatched: true, adsClicked: true, timeSpent: true,
        createdAt: true 
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/nsfw
router.patch('/nsfw', authMiddleware, async (req, res) => {
  try {
    const { nsfw } = req.body;
    if (typeof nsfw !== 'boolean') return res.status(400).json({ error: 'nsfw must be a boolean' });
    const result = await authService.updateNsfw(req.user.userId, nsfw);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/me
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    await authService.deleteAccount(req.user.userId);
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
