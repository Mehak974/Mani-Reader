'use strict';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  try {
    // Skip check for admin and auth routes so admin can still login and turn it off
    if (req.path.includes('/admin') || req.path.includes('/auth')) return next();

    const setting = await prisma.systemSetting.findUnique({ where: { key: 'maintenance' } });
    
    if (setting && setting.value === 'true') {
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
