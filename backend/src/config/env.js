'use strict';
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

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

  clientUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://manireader.online',
  apiUrl: process.env.API_URL || 'https://api.manireader.online',

  consumet: {
    url: process.env.CONSUMET_URL || 'https://api.consumet.org',
    primary: process.env.PRIMARY_PROVIDER || 'mangakatana',
    fallback: process.env.CONSUMET_FALLBACK_PROVIDER || 'mangakakalot',
    timeout: 30000,
  },

  imageProxyUrl: (() => {
    const api = process.env.API_URL || 'https://api.manireader.online';
    const proxy = process.env.IMAGE_PROXY_URL;
    if (!proxy) {
      return process.env.NODE_ENV === 'production'
        ? `${api}/api/image`
        : `http://localhost:${process.env.PORT || '4000'}/api/image`;
    }
    if (proxy.startsWith('/')) {
      return `${api}${proxy}`;
    }
    return proxy;
  })(),

  cache: {
    redisUrl: process.env.REDIS_URL || null,
    searchTtl: 300, // 5 minutes for home page/search freshness
    chaptersTtl: 43200,
    mangaTtl: 3600, // 1 hour for manga info updates
    authTtl: 3600,
  },

  downloads: {
    dir: process.env.DOWNLOADS_DIR || './downloads',
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || null,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'https://api.manireader.online/api/auth/google/callback',
  },
};
