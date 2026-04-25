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

  if (!isExcluded) {
    analyticsService.trackTraffic();
  }

  // If logged in, update lastActiveAt and increment pagesViewed
  if (req.user?.userId) {
    prisma.user.update({
      where: { id: req.user.userId },
      data: { 
        lastActiveAt: new Date(),
        pagesViewed: { increment: 1 }
      }
    }).catch(() => {});
  }

  next();
};
