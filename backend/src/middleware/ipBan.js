'use strict';
const prisma = require('../lib/prisma');

// ⚡ Cache banned IPs for 60 s to avoid a DB query on every request
const _banCache = new Map(); // ip -> { banned: bool, expiresAt: number }

module.exports = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'];
    if (ip) {
      const cached = _banCache.get(ip);
      if (cached && Date.now() < cached.expiresAt) {
        if (cached.banned) {
          return res.status(403).json({ 
            error: 'Access Denied', 
            message: 'Your IP has been permanently blocked by the administrator.',
            reason: cached.reason 
          });
        }
        return next();
      }

      const isBanned = await prisma.bannedIp.findUnique({ where: { ip } });
      _banCache.set(ip, {
        banned: !!isBanned,
        reason: isBanned?.reason,
        expiresAt: Date.now() + 60_000
      });

      if (isBanned) {
        return res.status(403).json({ 
          error: 'Access Denied', 
          message: 'Your IP has been permanently blocked by the administrator.',
          reason: isBanned.reason 
        });
      }
    }
    next();
  } catch (err) {
    console.error('IP Ban Check Error:', err);
    next();
  }
};
