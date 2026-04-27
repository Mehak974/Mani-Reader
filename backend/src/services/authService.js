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

// ── Service Methods ───────────────────────────────────────────────────────────

async function register(email, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed },
  });

  const payload = { userId: user.id, email: user.email, role: user.role };
  return {
    user: safeUser(user),
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const payload = { userId: user.id, email: user.email, role: user.role };
  return {
    user: safeUser(user),
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function refresh(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.refreshSecret);
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw Object.assign(new Error('User not found'), { status: 401 });

  const payload = { userId: user.id, email: user.email, role: user.role };
  return { accessToken: signAccessToken(payload) };
}

async function updateNsfw(userId, nsfw) {
  return prisma.user.update({ where: { id: userId }, data: { nsfw }, select: { nsfw: true } });
}

async function deleteAccount(userId) {
  return prisma.user.delete({ where: { id: userId } });
}

async function googleLogin(email, googleId) {
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    // Create new user for Google signup
    user = await prisma.user.create({
      data: { 
        email, 
        googleId,
        password: null, // Password is null for social login users
        role: 'USER'
      },
    });
  } else if (!user.googleId) {
    // Link existing email account to Google if not already linked
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId }
    });
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  return {
    user: safeUser(user),
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

module.exports = { register, login, refresh, updateNsfw, deleteAccount, googleLogin };
