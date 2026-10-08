// PostgreSQL connection pool, shared across hot reloads in dev.

import { Pool } from 'pg';

const globalForDb = globalThis;

if (!globalForDb.__autocontrolePool) {
  globalForDb.__autocontrolePool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });
}

export const pool = globalForDb.__autocontrolePool;

export function query(text, params) {
  return pool.query(text, params);
}
