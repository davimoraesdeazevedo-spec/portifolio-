// Compose healthcheck for the `web` service.
//
// The web container runs both the frontend and the API, so this probes the
// three components that must be alive: the rendered page, the API route
// handlers and PostgreSQL. It reports which component failed instead of just
// exiting 1.
//
// /api/auth/me is public and always answers 200, so it probes the API without
// needing a session; the database is probed directly with `pg` because the
// dashboard endpoint requires login.

const { Client } = require('pg');

const BASE_URL = 'http://127.0.0.1:3000';

const checks = [
  [
    'frontend',
    async () => {
      const res = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      if (!html.includes('Autocontrole')) throw new Error('page does not look like the app');
    },
  ],
  [
    'api',
    async () => {
      const res = await fetch(`${BASE_URL}/api/auth/me`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || typeof data !== 'object') throw new Error('unexpected payload');
    },
  ],
  [
    'db',
    async () => {
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      try {
        await client.connect();
        await client.query('SELECT 1');
      } finally {
        await client.end().catch(() => {});
      }
    },
  ],
];

(async () => {
  const failures = [];
  for (const [name, check] of checks) {
    try {
      await check();
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
    }
  }

  if (failures.length > 0) {
    console.error(`[base44] unhealthy -> ${failures.join(' | ')}`);
    process.exit(1);
  }

  console.log('[base44] frontend, api and db healthy');
})();
