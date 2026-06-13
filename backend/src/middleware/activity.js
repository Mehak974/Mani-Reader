'use strict';
const prisma = require('../lib/prisma');
const analyticsService = require('../services/analyticsService');

// ⚡ Debounce guest activity writes: track only once per guestId per 60s
const _recentGuests = new Map(); // guestId -> timestamp

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
    // ⚡ Fire-and-forget: never await analytics writes
    analyticsService.trackTraffic(isGuest).catch(() => {});
  }

  // If logged in, update lastActiveAt and increment pagesViewed
  if (!isGuest) {
    // ⚡ Fire-and-forget
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
      // ⚡ Debounce: skip if this guest was tracked less than 60s ago
      const lastSeen = _recentGuests.get(guestId);
      if (lastSeen && Date.now() - lastSeen < 60_000) {
        // Already tracked recently, skip DB writes entirely
      } else {
        _recentGuests.set(guestId, Date.now());

        // Prevent unbounded memory growth (trim oldest entries every 1000 guests)
        if (_recentGuests.size > 1000) {
          const cutoff = Date.now() - 60_000;
          for (const [k, v] of _recentGuests) {
            if (v < cutoff) _recentGuests.delete(k);
          }
        }

        // ⚡ Fire-and-forget: all guest tracking is non-critical
        prisma.guestActivity.upsert({
          where: { mangaId_guestId: { mangaId: 'SITE_WIDE', guestId } },
          update: { createdAt: new Date() },
          create: { mangaId: 'SITE_WIDE', guestId }
        }).catch(() => {});

        if (deviceId) {
          prisma.guestUser.findFirst({ where: { deviceId } }).then(guest => {
            if (guest) {
              prisma.guestUser.update({
                where: { id: guest.id },
                data: { lastActive: new Date(), ip, userAgent: req.headers['user-agent'] }
              }).catch(() => {});
            } else {
              prisma.guestUser.create({
                data: { deviceId, ip, userAgent: req.headers['user-agent'] }
              }).then(() => {
                analyticsService.trackNewGuest().catch(() => {});
              }).catch(() => {});
            }
          }).catch(() => {});
        }
      }
    }
  }

  next();
};

