#!/usr/bin/env sh
set -eu

PORT="${PORT:-10000}"
echo "[RENDER] Demarrage du backend..."
echo "[RENDER] PORT=${PORT}"

# Appliquer les migrations en prod (idempotent) pour éviter les erreurs de schema
if [ "${APPLIQUER_PRISMA_MIGRATE:-true}" = "true" ]; then
  echo "[RENDER] prisma migrate deploy..."
  npx prisma migrate deploy
fi

echo "[RENDER] Lancement Next.js..."
exec npx next start -H 0.0.0.0 -p "${PORT}"
