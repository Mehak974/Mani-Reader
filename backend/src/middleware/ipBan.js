'use strict';
const prisma = require('../lib/prisma');

module.exports = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'];
    if (ip) {
      const isBanned = await prisma.bannedIp.findUnique({ where: { ip } });
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
