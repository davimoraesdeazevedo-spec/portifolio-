# AGENTS.md — NebuZX portfolio

Static site: `index.html` + `style.css` + `script.js`. No framework, no build step,
no test suite.

## Running it (Base44 sandbox)

```bash
docker compose -f docker-compose.base44.yml up -d
curl -sf http://localhost:3000/ >/dev/null && echo up
```

- `web` = `node:22` running a **Vite dev server from the bind-mounted source** on host
  port 3000 (live reload: HTML change → full reload, CSS/JS → hot update). There is no
  production build to run instead.
- `node_modules` is a named volume, installed on container start from `package.json`
  (`package-lock.json` is committed). Vite 6 is only a dev server here — the site itself
  has no dependencies.
- The proxy host allowlist is handled by passing `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`
  through bare in Compose (plain `--host 0.0.0.0` is not enough).
- Health: `docker compose ps` should show `(healthy)`; the check fetches `/` with `node -e fetch`.

## Non-obvious findings

- **Why it previously "failed to start":** the repo had no server, no `package.json` and no
  Compose file, so nothing ever listened on port 3000. The `docker-compose.base44.yml` here
  is what makes it runnable; the site code itself was never a build.
- **Line endings are CRLF** in `index.html`, `style.css` and `script.js`. Patch them with
  CRLF-aware tools (e.g. `perl -0777 -pi`); LF-based find/replace silently misses.
- **Percentage counters** in `script.js` (`contador()`) target ids `pythonNumero` /
  `javaNumero` / `cppNumero`. Those ids must live on the skill badges inside
  `#habilidades`; they were originally stranded as stray markup *after* `</html>` and
  updated nothing visible. `contador()` also guards `final <= 0`, otherwise a 0% target
  finishes on "1%".
- **`img/bot.png` is referenced but has never been committed** (not in any git history).
  It is the only missing asset. Note Vite's SPA fallback answers unknown paths with
  `index.html` and HTTP 200, so the browser reports no failed request — the image simply
  renders broken. Do not read a 200 on that path as "asset exists".
- `origin/base44/setup-5ae8ad51` contains an **unrelated Next.js app** (a quality-management
  project) left over from an earlier repository state. Its Compose file, `.base44/environment.json`
  and DB migrations do NOT apply here — ignore them.

## Verifying a change

1. `curl -s http://localhost:3000/` → page HTML with `/@vite/client` injected (proves the
   dev server is serving live source, not a prebuilt bundle).
2. `curl -s -H 'Accept: text/css,*/*;q=0.1' http://localhost:3000/style.css` → `text/css`
   (a bare `curl` gets JS, which is normal for Vite and not a regression).
3. Browser checks: no `vite-error-overlay`, body has content, `#loader` ends up
   `display: none` (~3.2 s after load), `#typing` types the hero subtitle.
