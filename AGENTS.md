# AGENTS.md

## Project

`Autocontrole` — a PWA for managing Programas de Autocontrole (PAC), APPCC,
rastreabilidade and quality control in meat/food industries registered with
SIM, SISBI, SIE and SIF.

Stack: **Next.js (React, App Router)** for the UI **and** the Node.js API
(`src/app/api/**` route handlers), **PostgreSQL** for storage. No ORM — plain
`pg` with parameterized queries.

## Architecture notes

- `src/lib/resources.js` is the backbone: a per-table registry of whitelisted
  columns and their types. The generic routes `src/app/api/[resource]/route.js`
  and `src/app/api/[resource]/[id]/route.js` serve every CRUD screen, so a new
  field is added in **one** place (registry + `db/schema.sql`) and no route code.
  Column names never come from the request.
- `src/lib/resource-service.js` does the coercion, required-field checks, and the
  `BEFORE_WRITE` hooks (e.g. `temperaturas.conforme` is derived from the reading
  and its limits — it is deliberately not user-entered).
- `src/components/CrudResource.jsx` renders list + create form for every module.
  `onLoaded` is held in a ref on purpose: an inline callback from a page must not
  retrigger the fetch effect.
- Only a handful of endpoints are hand-written: `/api/dashboard`,
  `/api/rastreabilidade` (lot tracing across the three stages) and
  `/api/uploads`.
- All pages are client components that fetch from the API, so nothing reads the
  database at build time (keeps `next build` working for Vercel/Supabase deploys).

## Run it (Base44 sandbox)

```bash
docker compose -f docker-compose.base44.yml up -d
```

Three services: `db` (postgres:16, data in the `db_data` volume), `migrate`
(one-shot, applies `db/schema.sql` + `db/seed.sql`), and `web` (Next dev server
on port 3000). `web` waits for `migrate` to finish, so the schema and demo data
are in place before the app answers.

- Both SQL files are idempotent (fixed ids + `ON CONFLICT DO NOTHING`), so the
  stack is safe to restart and the seed will not duplicate rows.
- `scripts/base44-entrypoint.sh` syncs `node_modules` from `package-lock.json`
  into the shared volume and skips reinstalling when the hash is unchanged. Run
  `docker run --rm -v "$PWD:/app" -w /app node:22-slim npm install
  --package-lock-only` after changing `package.json`.
- After a schema change, re-run the migration: `docker compose
  -f docker-compose.base44.yml up -d --force-recreate migrate`, then reload the
  preview.

## Sandbox quirks

- **`allowedDevOrigins` is mandatory here.** The preview is served from
  `https://3000-<suffix>` while the dev server sees a different host, and Next
  blocks dev assets/HMR by Origin. `next.config.mjs` appends
  `'3000-' + BASE44_PUBLIC_HOST_SUFFIX` **only** when `BASE44_PREVIEW_MODE === '1'`;
  otherwise the list is empty and behavior is the normal Next default.
- Uploads (laudos PDF, fotos de não conformidade) are written to the `uploads`
  volume at `UPLOAD_DIR` and served by `/api/uploads/[name]`. Files live outside
  the repository on purpose.
- The service worker is registered **only** in a production build, so it can
  never serve a stale bundle over the dev server in the preview.
- The dev server does not pick up `.env.base44-defaults` changes without a
  restart; `DATABASE_URL` for local Postgres lives in that file, as a placeholder
  that a real secret from `/run/base44/app.env` overrides.

## Verify

```bash
curl -s http://localhost:3000/api/dashboard | head -c 200     # API + database
curl -s http://localhost:3000/ | grep -c Autocontrole          # page renders
curl -s "http://localhost:3000/api/rastreabilidade?lote=LP-2026-0118"
docker compose -f docker-compose.base44.yml ps
```

## Not configured here

Deployment to Supabase + Vercel is the intended production target but is not set
up in this repository (no `vercel.json`, no Supabase client). Point `DATABASE_URL`
at the Supabase Postgres connection string, then `npm run build` / `npm start`.
