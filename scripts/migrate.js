// Applies db/schema.sql and db/seed.sql.
//
// Runs as a one-shot compose service before `web` starts. Both files are
// idempotent (CREATE TABLE IF NOT EXISTS / ON CONFLICT DO NOTHING), so this is
// safe to run on every boot and after a schema change.

const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const DB_DIR = path.join(__dirname, '..', 'db');
const FILES = ['schema.sql', 'seed.sql'];

async function connectWithRetry(connectionString) {
  let lastError;
  for (let attempt = 1; attempt <= 15; attempt++) {
    const client = new Client({ connectionString });
    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
      console.log(`[base44] database not ready (attempt ${attempt}/15): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw lastError;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const client = await connectWithRetry(connectionString);
  try {
    for (const file of FILES) {
      const sql = fs.readFileSync(path.join(DB_DIR, file), 'utf8');
      console.log(`[base44] applying db/${file}`);
      await client.query(sql);
    }

    const { rows } = await client.query(
      'SELECT (SELECT count(*) FROM pcc)::int AS pcc, (SELECT count(*) FROM producao)::int AS producao'
    );
    console.log(`[base44] database ready — ${rows[0].pcc} PCCs, ${rows[0].producao} production records`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`[base44] migration failed: ${error.message}`);
  process.exit(1);
});
