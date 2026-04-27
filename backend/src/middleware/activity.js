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
    // For guests, track "active" by creating/updating a GuestActivity record
    // We use a simple cookie or IP as guest identifier
    const guestId = req.cookies?.mani_guest_id || req.ip;
    if (guestId && req.method === 'GET' && !isExcluded) {
       prisma.guestActivity.upsert({
         where: { mangaId_guestId: { mangaId: 'SITE_WIDE', guestId } },
         update: { createdAt: new Date() },
         create: { mangaId: 'SITE_WIDE', guestId }
       }).catch(() => {});
    }
  }

  next();
};
