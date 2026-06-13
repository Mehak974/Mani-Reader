'use strict';
const prisma = require('../lib/prisma');

// ⚡ Cache the maintenance flag for 30 s – avoids a DB query on every single HTTP request
let _cached = { value: false, expiresAt: 0 };

module.exports = async (req, res, next) => {
  try {
    // Skip check for admin and auth routes so admin can still login and turn it off
    if (req.path.includes('/admin') || req.path.includes('/auth')) return next();

    let isMaintenance = _cached.value;

    if (Date.now() > _cached.expiresAt) {
      const setting = await prisma.systemSetting.findUnique({ where: { key: 'maintenance' } });
      isMaintenance = setting?.value === 'true';
      _cached = { value: isMaintenance, expiresAt: Date.now() + 30_000 };
    }

    if (isMaintenance) {
      // Allow admins to bypass maintenance if they are logged in
      if (req.user?.role === 'ADMIN') return next();

      return res.status(503).json({ 
        error: 'Service Unavailable',
        message: 'The site is currently undergoing scheduled maintenance. Please check back later.' 
      });
    }
    next();
  } catch (err) {
    next();
  }
};
