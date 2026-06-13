'use strict';
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const isDev = config.nodeEnv !== 'production';

// In development, we use very high limits to avoid blocking the developer/admin
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => isDev // Completely skip in dev if preferred, but high limit is safer
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 20,
  message: { error: 'Too many auth attempts, please try again later.' },
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 500 : 30,
  message: { error: 'Search rate limit exceeded.' },
});

module.exports = { defaultLimiter, authLimiter, searchLimiter };
