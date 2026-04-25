'use strict';
const { PrismaClient } = require('@prisma/client');

/**
 * Shared Prisma Client instance
 * Prevents multiple instances being created during hot-reloading or multi-middleware usage.
 */
const prisma = new PrismaClient();

module.exports = prisma;
