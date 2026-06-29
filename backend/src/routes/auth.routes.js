'use strict';
const router = require('express').Router();
const authService = require('../services/authService');
const { validate, schemas } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/auth');
const passport = require('../config/passport');
const { clientUrl, nodeEnv } = require('../config/env');
const crypto = require('crypto');

// ── Cookie helper ─────────────────────────────────────────────────────────────
// FIX #1 & #10: Added secure:true so cookies are HTTPS-only in production.
const COOKIE_BASE = {
  httpOnly: true,
  sameSite: 'lax',
  secure: nodeEnv === 'production',
};

// ── OTC store for Google OAuth (Fix #1) ──────────────────────────────────────
// Tokens must never appear in redirect URLs (logs, referrer headers, history).
// Instead we issue a one-time code that the frontend exchanges for real tokens.
const otcStore = new Map(); // code -> { accessToken, refreshToken, expiresAt }

function issueOtc(accessToken, refreshToken) {
  const code = crypto.randomBytes(32).toString('hex');
  otcStore.set(code, { accessToken, refreshToken, expiresAt: Date.now() + 60_000 });
  // Auto-expire codes that were never consumed
  setTimeout(() => otcStore.delete(code), 60_000);
  return code;
}

// POST /api/auth/register
router.post('/register', authLimiter, validate(schemas.register), async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);
    res.cookie('token', result.accessToken, { ...COOKIE_BASE, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', result.refreshToken, { ...COOKIE_BASE, maxAge: 7 * 24 * 60 * 60 * 1000 });
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
    res.cookie('token', result.accessToken, { ...COOKIE_BASE, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', result.refreshToken, { ...COOKIE_BASE, maxAge: 7 * 24 * 60 * 60 * 1000 });
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
    res.cookie('token', result.accessToken, { ...COOKIE_BASE, maxAge: 15 * 60 * 1000 });
    // FIX #9: rotate the refresh token on every use
    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, { ...COOKIE_BASE, maxAge: 7 * 24 * 60 * 60 * 1000 });
    }
    res.json({ accessToken: result.accessToken });
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

// GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback
// FIX #1: Tokens are NEVER placed in the redirect URL.
// We issue a short-lived one-time code (60 s) that the frontend exchanges for real tokens.
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${clientUrl}/auth/login?error=google_failed` }),
  (req, res) => {
    const { accessToken, refreshToken } = req.user;
    const code = issueOtc(accessToken, refreshToken);
    res.redirect(`${clientUrl}/auth/callback?code=${code}`);
  }
);

// POST /api/auth/google/exchange
// Frontend calls this once with the OTC to receive real tokens via httpOnly cookie.
router.post('/google/exchange', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code required' });

  const entry = otcStore.get(code);
  if (!entry || Date.now() > entry.expiresAt) {
    otcStore.delete(code);
    return res.status(400).json({ error: 'Invalid or expired code' });
  }
  otcStore.delete(code); // one-time use

  const { accessToken, refreshToken } = entry;
  res.cookie('token', accessToken, { ...COOKIE_BASE, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...COOKIE_BASE, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ accessToken });
});

module.exports = router;
