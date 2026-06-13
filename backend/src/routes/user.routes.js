'use strict';
const router = require('express').Router();
const auth = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');
const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');

// Middleware to extract user from token without failing if missing
const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.slice(7);
    if (token) {
      req.user = jwt.verify(token, jwtConfig.secret);
    }
  } catch {}
  next();
};

// POST /api/user/ad-event
router.post('/ad-event', optionalAuth, async (req, res) => {
  try {
    const { type } = req.body; // 'watch' or 'click'

    // Skip tracking for admins
    if (req.user?.role === 'ADMIN') {
      return res.json({ success: true, message: 'Admin activity not tracked' });
    }
    
    if (req.user?.userId) {
      if (type === 'watch') {
        await prisma.user.update({ where: { id: req.user.userId }, data: { adsWatched: { increment: 1 } } });
      } else if (type === 'click') {
        await prisma.user.update({ where: { id: req.user.userId }, data: { adsClicked: { increment: 1 } } });
      }
    }

    if (type === 'watch') await analyticsService.trackAdWatch();
    else if (type === 'click') await analyticsService.trackAdClick();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/heartbeat
router.post('/heartbeat', optionalAuth, async (req, res) => {
  try {
    const { ms = 60000 } = req.body; // default 1 min
    
    // Skip all tracking for admins
    if (req.user?.role === 'ADMIN') {
      return res.json({ success: true, message: 'Admin time not tracked' });
    }

    // ⚡ Fire-and-forget: don't await DB writes on heartbeat (runs every 60s per client)
    if (req.user?.userId) {
      prisma.user.update({
        where: { id: req.user.userId },
        data: { timeSpent: { increment: ms } }
      }).catch(() => {});
    }

    analyticsService.trackSessionTime(ms).catch(() => {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
