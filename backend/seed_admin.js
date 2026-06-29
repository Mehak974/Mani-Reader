'use strict';
/**
 * seed_admin.js — Creates or updates the admin user.
 *
 * FIX #4: Credentials are now read from environment variables (or CLI args),
 * never hardcoded in source code.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=<strong-password> node seed_admin.js
 * Or:
 *   node seed_admin.js you@example.com <strong-password>
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ERROR: Provide credentials via env vars or CLI args.');
    console.error('  ADMIN_EMAIL=x ADMIN_PASSWORD=y node seed_admin.js');
    console.error('  node seed_admin.js <email> <password>');
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('ERROR: Admin password must be at least 12 characters.');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({ where: { email }, data: { password: hashed, role: 'ADMIN' } });
    console.log(`Admin user updated: ${email}`);
  } else {
    await prisma.user.create({ data: { email, password: hashed, role: 'ADMIN' } });
    console.log(`Admin user created: ${email}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
