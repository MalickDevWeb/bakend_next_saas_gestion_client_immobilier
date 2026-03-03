#!/usr/bin/env sh
set -eu

echo "[RENDER] Demarrage du backend..."

echo "[RENDER] PORT=${PORT:-10000}"

if [ "${APPLIQUER_PRISMA_PUSH:-true}" = "true" ]; then
  echo "[RENDER] Application du schema Prisma (db push)..."
  npx prisma db push
fi

echo "[RENDER] Lancement Next.js..."
exec npx next start -H 0.0.0.0 -p "${PORT:-10000}"
