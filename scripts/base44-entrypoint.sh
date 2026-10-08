#!/bin/sh
# Base44 sandbox entrypoint.
#
# node_modules lives in a Docker volume, so dependencies are synced from the
# committed lockfile here on container startup, after the bind mount is in place.
# Both the `migrate` and `web` services use this script, and compose starts them
# in order (web waits for migrate to complete), so only one installer ever runs
# against the shared node_modules volume.
#
# Reinstalls only when package-lock.json changed, so restarts are fast.

set -e

LOCK_HASH_FILE=node_modules/.base44-lockhash

if [ -f package-lock.json ]; then
    CURRENT_HASH=$(md5sum package-lock.json | cut -d' ' -f1)
    if [ -f "$LOCK_HASH_FILE" ] && [ "$(cat "$LOCK_HASH_FILE")" = "$CURRENT_HASH" ]; then
        echo "[base44] dependencies already in sync with package-lock.json"
    else
        echo "[base44] installing dependencies from package-lock.json..."
        npm ci --no-audit --no-fund
        printf '%s' "$CURRENT_HASH" > "$LOCK_HASH_FILE"
    fi
else
    echo "[base44] no package-lock.json yet; running npm install..."
    npm install --no-audit --no-fund
fi

mkdir -p "${UPLOAD_DIR:-/app/uploads}"

exec "$@"
