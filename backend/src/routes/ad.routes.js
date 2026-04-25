'use strict';
const router = require('express').Router();

/**
 * AD SERVICE
 * 
 * Returns a random unclickable banner ad.
 */
const ADS = [
  { id: 1, image: 'https://placehold.co/728x90/1a1a2e/6c63ff?text=PREMIUM+MANGA+ACCESS', name: 'Premium Promo' },
  { id: 2, image: 'https://placehold.co/728x90/16213e/00d2ff?text=NEW+RELEASES+EVERY+HOUR', name: 'Release Promo' },
  { id: 3, image: 'https://placehold.co/728x90/0f3460/ff2e63?text=JOIN+OUR+COMMUNITY+DISCORD', name: 'Discord Promo' },
  { id: 4, image: 'https://placehold.co/728x90/1a1a2e/22d3a0?text=EXPERIENCE+ZERO+LAG+READING', name: 'Speed Promo' },
];

router.get('/random', (req, res) => {
  const ad = ADS[Math.floor(Math.random() * ADS.length)];
  res.json(ad);
});

router.post('/track-impression', async (req, res) => {
  try {
    const analyticsService = require('../services/analyticsService');
    await analyticsService.trackAdImpression();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
