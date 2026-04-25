'use strict';
/**
 * MANGA READER — API GATEWAY / EXPRESS SERVER
 *
 * Responsibilities:
 *  - Route registration
 *  - Auth middleware
 *  - Rate limiting
 *  - CORS
 *  - No business logic here
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const { defaultLimiter } = require('./middleware/rateLimiter');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const mangaRoutes = require('./routes/manga.routes');
const chapterRoutes = require('./routes/chapter.routes');
const libraryRoutes = require('./routes/library.routes');
const bookmarkRoutes = require('./routes/bookmark.routes');
const historyRoutes = require('./routes/history.routes');
const progressRoutes = require('./routes/progress.routes');
const proxyRoutes = require('./routes/proxy.routes');
const adminRoutes = require('./routes/admin.routes');
const contactRoutes = require('./routes/contact.routes');
const userRoutes = require('./routes/user.routes');
const adRoutes = require('./routes/ad.routes');

// ── Middlewares ──────────────────────────────────────────────────────────────
const maintenanceMiddleware = require('./middleware/maintenance');
const activityMiddleware = require('./middleware/activity');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('./config/env');

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();

// ── Critical Gatekeepers ──────────────────────────────────────────────────────
const ipBanMiddleware = require('./middleware/ipBan');
app.use(ipBanMiddleware);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
}));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Global Activity Tracking ──────────────────────────────────────────────────
app.use(async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.slice(7);
    if (token) {
      req.user = jwt.verify(token, jwtConfig.secret);
    }
  } catch { /* ignore invalid tokens for tracking */ }
  
  activityMiddleware(req, res, next);
});

app.use(maintenanceMiddleware);

// Global rate limit
app.use(defaultLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'manga-reader-api',
    timestamp: new Date().toISOString(),
    consumetUrl: config.consumet.url,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/search', mangaRoutes);
app.use('/api/manga', mangaRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/chapter', chapterRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/bookmark', bookmarkRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/image', proxyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ads', adRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n🚀 Manga Reader API running on http://localhost:${config.port}`);
  console.log(`   Consumet API: ${config.consumet.url}`);
  console.log(`   Environment: ${config.nodeEnv}\n`);
});

module.exports = app;
