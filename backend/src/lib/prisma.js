'use strict';
const { PrismaClient } = require('@prisma/client');

/**
 * Shared Prisma Client singleton.
 *
 * ⚡ Performance guardrails:
 *  - Uses globalThis to guarantee ONE instance across hot-reloads (nodemon).
 *  - Logs slow queries (>2 s) so we can spot bottlenecks quickly.
 */

const LOG_SLOW_MS = 2000; // warn when a query takes longer than 2 s

function createClient() {
  const client = new PrismaClient({
    log: [
      { level: 'warn', emit: 'stdout' },
      { level: 'error', emit: 'stdout' },
    ],
  });

  // Middleware: log slow queries
  client.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;
    if (duration > LOG_SLOW_MS) {
      console.warn(
        `[Prisma SLOW] ${params.model}.${params.action} took ${duration}ms`
      );
    }
    return result;
  });

  return client;
}

// Singleton via globalThis – survives nodemon restarts without leaking pools
const prisma = globalThis.__prisma || createClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

module.exports = prisma;
