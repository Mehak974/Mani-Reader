'use strict';
require('dotenv').config();

const required = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

module.exports = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    url: required('DATABASE_URL'),
  },

  jwt: {
    secret: required('JWT_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  consumet: {
    url: process.env.CONSUMET_URL || 'http://localhost:3000',
    primary: process.env.CONSUMET_PRIMARY_PROVIDER || 'mangadex',
    fallback: process.env.CONSUMET_FALLBACK_PROVIDER || 'mangakakalot',
  },

  cache: {
    redisUrl: process.env.REDIS_URL || null,
    searchTtl: parseInt(process.env.CACHE_SEARCH_TTL || '300', 10),
    chaptersTtl: parseInt(process.env.CACHE_CHAPTERS_TTL || '600', 10),
    mangaTtl: parseInt(process.env.CACHE_MANGA_TTL || '1800', 10),
  },

  downloads: {
    dir: process.env.DOWNLOADS_DIR || './downloads',
  },
};
