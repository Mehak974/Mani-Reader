'use strict';
const prisma = require('../lib/prisma');
const analyticsService = require('../services/analyticsService');

module.exports = async (req, res, next) => {
  // Track traffic for every request EXCEPT admin panel and heartbeats
  const path = req.originalUrl || req.path;
  const isExcluded = 
    path.includes('/admin') || 
    path.includes('/heartbeat') || 
    path.includes('/health') || 
    path.includes('/auth/me'); // Don't count "checking if I'm logged in" as traffic

  const isGuest = !req.user?.userId;

  if (!isExcluded) {
    analyticsService.trackTraffic(isGuest);
  }

  // If logged in, update lastActiveAt and increment pagesViewed
  if (!isGuest) {
    prisma.user.update({
      where: { id: req.user.userId },
      data: { 
        lastActiveAt: new Date(),
        pagesViewed: { increment: 1 }
      }
    }).catch(() => {});
  } else {
    // For guests, track "active" by creating/updating a GuestUser record
    const guestId = req.headers['x-device-id'] || req.cookies?.mani_guest_id || req.ip;
    const deviceId = req.headers['x-device-id'] || null;
    const ip = req.ip;

    if (guestId && req.method === 'GET' && !isExcluded) {
       // Track site-wide activity for leaderboard/active stats
       prisma.guestActivity.upsert({
         where: { mangaId_guestId: { mangaId: 'SITE_WIDE', guestId } },
         update: { createdAt: new Date() },
         create: { mangaId: 'SITE_WIDE', guestId }
       }).catch(() => {});

       // Track unique Guest User globally
       prisma.guestUser.upsert({
         where: { ip_deviceId: { ip, deviceId } },
         update: { lastActive: new Date(), userAgent: req.headers['user-agent'] },
         create: { ip, deviceId, userAgent: req.headers['user-agent'] }
       }).then((guest) => {
         // If it was just created (approx), track as new guest
         const isJustCreated = (new Date() - new Date(guest.createdAt)) < 5000;
         if (isJustCreated) {
            analyticsService.trackNewGuest().catch(() => {});
         }
       }).catch(() => {});
    }
  }

  next();
};
