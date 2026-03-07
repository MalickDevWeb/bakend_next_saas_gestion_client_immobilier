#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${KYA_API_BASE_URL:-http://127.0.0.1:3000}}"
CRON_SECRET="${2:-${AUDIT_AUTO_EXPORT_CRON_SECRET:-${SUPER_ADMIN_REPORT_CRON_SECRET:-}}}"

if [[ -z "${CRON_SECRET}" ]]; then
  echo "AUDIT_AUTO_EXPORT_CRON_SECRET manquant" >&2
  exit 1
fi

URL="${BASE_URL%/}/api/audit_logs/auto-export"

curl --fail --silent --show-error \
  -H "x-cron-secret: ${CRON_SECRET}" \
  "${URL}"
