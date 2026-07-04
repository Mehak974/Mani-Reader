'use strict';
/**
 * CACHE LAYER
 *
 * Uses node-cache (in-memory) by default.
 * If REDIS_URL is set, switches to ioredis.
 * TTLs are configured via env vars.
 */

const NodeCache = require('node-cache');
const config = require('../config/env');

let cache;
let useRedis = false;

if (config.cache.redisUrl) {
  const Redis = require('ioredis');
  const redis = new Redis(config.cache.redisUrl);
  redis.on('error', (err) => console.error('[Cache] Redis error:', err.message));
  useRedis = true;

  cache = {
    async get(key) {
      const val = await redis.get(key);
      return val ? JSON.parse(val) : null;
    },
    async set(key, value, ttlSeconds) {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    },
    async del(key) {
      await redis.del(key);
    },
  };

  // Redis is preferred for distributed caching
} else {
  const nodeCache = new NodeCache({ useClones: false });

  cache = {
    async get(key) {
      return nodeCache.get(key) ?? null;
    },
    async set(key, value, ttlSeconds) {
      nodeCache.set(key, value, ttlSeconds);
    },
    async del(key) {
      nodeCache.del(key);
    },
  };

  // Fallback to local memory
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

async function getOrSet(key, ttlSeconds, fetchFn) {
  const cached = await cache.get(key);
  if (cached !== null) return cached;
  const fresh = await fetchFn();
  
  // Don't cache empty results (empty arrays, or objects with empty results arrays) to prevent caching transient scraper/network failures
  const isEmpty = !fresh || 
                  (Array.isArray(fresh) && fresh.length === 0) || 
                  (typeof fresh === 'object' && fresh.results && Array.isArray(fresh.results) && fresh.results.length === 0);
                  
  if (!isEmpty) {
    await cache.set(key, fresh, ttlSeconds);
  }
  return fresh;
}

module.exports = {
  get: cache.get.bind(cache),
  set: cache.set.bind(cache),
  del: cache.del.bind(cache),
  getOrSet,
  ttl: config.cache,
};
