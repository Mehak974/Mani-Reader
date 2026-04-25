'use strict';
const authMiddleware = require('./auth');

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied: Requires ADMIN role' });
    }
  });
}

module.exports = adminMiddleware;
