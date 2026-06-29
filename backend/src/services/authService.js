'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { jwt: jwtConfig } = require('../config/env');

// ── Helpers ───────────────────────────────────────────────────────────────────

function signAccessToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });
}

function safeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

async function storeRefreshToken(token, userId) {
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}

// ── Service Methods ───────────────────────────────────────────────────────────

async function register(email, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed },
  });

  const analyticsService = require('./analyticsService');
  analyticsService.trackNewUser().catch(() => {});

  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await storeRefreshToken(refreshToken, user.id);

  return { user: safeUser(user), accessToken, refreshToken };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  // FIX #6: Reject banned accounts before issuing any token
  if (user.isBanned) throw Object.assign(new Error('Account suspended'), { status: 403 });

  // FIX #5: Social-login users have no password — reject instead of passing null to bcrypt
  if (!user.password) {
    throw Object.assign(
      new Error('This account uses Google Sign-In. Please log in with Google.'),
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await storeRefreshToken(refreshToken, user.id);

  return { user: safeUser(user), accessToken, refreshToken };
}

// FIX #9: Refresh token rotation.
// Each call consumes the old token and issues a new one.
// A token not in the DB is rejected and ALL sessions for that user are wiped
// (signals a stolen token being reused after the legitimate user already rotated it).
async function refresh(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.refreshSecret);
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored) {
    // Token not in DB — possible theft / replay. Invalidate ALL tokens for this user.
    await prisma.refreshToken.deleteMany({ where: { userId: decoded.userId } });
    throw Object.assign(new Error('Refresh token reuse detected — all sessions invalidated'), { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw Object.assign(new Error('User not found'), { status: 401 });

  // FIX #6: Also block banned users on token refresh
  if (user.isBanned) {
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    throw Object.assign(new Error('Account suspended'), { status: 403 });
  }

  // Rotate: delete old token, issue new pair
  await prisma.refreshToken.delete({ where: { token } });

  const payload = { userId: user.id, email: user.email, role: user.role };
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  await storeRefreshToken(newRefreshToken, user.id);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function updateNsfw(userId, nsfw) {
  return prisma.user.update({ where: { id: userId }, data: { nsfw }, select: { nsfw: true } });
}

async function deleteAccount(userId) {
  // Clean up refresh tokens on account deletion (also handled by CASCADE, but explicit is safer)
  await prisma.refreshToken.deleteMany({ where: { userId } });
  return prisma.user.delete({ where: { id: userId } });
}

async function googleLogin(email, googleId) {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        googleId,
        password: null,
        role: 'USER',
      },
    });
    const analyticsService = require('./analyticsService');
    analyticsService.trackNewUser().catch(() => {});
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId },
    });
  }

  // FIX #6: Block banned users from Google login too
  if (user.isBanned) throw Object.assign(new Error('Account suspended'), { status: 403 });

  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await storeRefreshToken(refreshToken, user.id);

  return { user: safeUser(user), accessToken, refreshToken };
}

module.exports = { register, login, refresh, updateNsfw, deleteAccount, googleLogin };
