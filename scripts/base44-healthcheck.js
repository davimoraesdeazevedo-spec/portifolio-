// Compose healthcheck for the `web` service.
//
// The web container runs both the frontend and the API, so this probes both:
// the rendered page and an API endpoint that reads PostgreSQL. It reports which
// component failed instead of just exiting 1.

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
    'api+db',
    async () => {
      const res = await fetch(`${BASE_URL}/api/dashboard`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || typeof data !== 'object') throw new Error('unexpected payload');
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

  console.log('[base44] frontend and api+db healthy');
})();
