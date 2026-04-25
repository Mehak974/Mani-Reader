'use strict';
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');

/**
 * Express middleware — verifies Bearer JWT in Authorization header or httpOnly cookie.
 * Attaches decoded payload to req.user.
 */
function authMiddleware(req, res, next) {
  try {
    let token = null;

    // Prefer Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // Fallback to cookie
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
