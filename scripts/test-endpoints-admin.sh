#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${BASE_URL:-}" ]]; then
  for candidate in "http://localhost:3100" "http://localhost:3000"; do
    if curl -fsS "${candidate}/api/sante" >/dev/null 2>&1; then
      BASE_URL="$candidate"
      break
    fi
  done
fi
BASE_URL="${BASE_URL:-http://localhost:3100}"

ADMIN_IDENTIFIANT="${ADMIN_IDENTIFIANT:-${SEED_ADMIN_TELEPHONE:-${SEED_ADMIN_EMAIL:-771234568}}}"
ADMIN_MOT_DE_PASSE="${ADMIN_MOT_DE_PASSE:-${SEED_ADMIN_MOT_DE_PASSE:-Admin@123456}}"

TMP_FILES=()
LAST_BODY=""
LAST_HEADERS=""
LAST_STATUS=""
PASS_COUNT=0

new_tmp() {
  local file
  file="$(mktemp)"
  TMP_FILES+=("$file")
  printf '%s' "$file"
}

cleanup() {
  for file in "${TMP_FILES[@]}"; do
    rm -f "$file"
  done
}
trap cleanup EXIT

log_step() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$1"
}

fail() {
  printf '\n[ECHEC] %s\n' "$1" >&2
  if [[ -n "$LAST_BODY" && -f "$LAST_BODY" ]]; then
    printf '[ECHEC] Reponse API:\n' >&2
    cat "$LAST_BODY" >&2
    printf '\n' >&2
  fi
  exit 1
}

read_json_path() {
  local file="$1"
  local path="$2"
  node - "$file" "$path" <<'NODE'
const fs = require('node:fs')
const file = process.argv[2]
const path = process.argv[3]
const data = JSON.parse(fs.readFileSync(file, 'utf8') || 'null')
const parts = path.split('.')
let current = data
for (const part of parts) {
  if (part === '') continue
  if (/^\d+$/.test(part)) {
    current = Array.isArray(current) ? current[Number(part)] : undefined
    continue
  }
  const arrayMatch = part.match(/^(.+)\[(\d+)\]$/)
  if (arrayMatch) {
    const key = arrayMatch[1]
    const index = Number(arrayMatch[2])
    current = current?.[key]
    current = Array.isArray(current) ? current[index] : undefined
    continue
  }
  current = current?.[part]
}
if (current === undefined) {
  process.stdout.write('')
} else if (typeof current === 'object') {
  process.stdout.write(JSON.stringify(current))
} else {
  process.stdout.write(String(current))
}
NODE
}

csrf_from_cookie() {
  local cookie_file="$1"
  awk '$6=="kya_csrf_token" {print $7}' "$cookie_file" | tail -n 1
}

call_api() {
  local method="$1"
  local path="$2"
  local cookie_file="$3"
  local data="${4:-}"
  local csrf="${5:-}"
  local body_file headers_file
  body_file="$(new_tmp)"
  headers_file="$(new_tmp)"

  local cmd=(
    curl -sS -X "$method" "${BASE_URL}${path}"
    -D "$headers_file"
    -o "$body_file"
    -b "$cookie_file"
    -c "$cookie_file"
  )
  if [[ -n "$csrf" ]]; then
    cmd+=(-H "x-csrf-token: ${csrf}")
  fi
  if [[ -n "$data" ]]; then
    cmd+=(-H "content-type: application/json" --data "$data")
  fi

  "${cmd[@]}"
  LAST_BODY="$body_file"
  LAST_HEADERS="$headers_file"
  LAST_STATUS="$(awk 'toupper($1) ~ /^HTTP\// {code=$2} END {print code}' "$headers_file")"
}

expect_one_of() {
  local expected found=0
  for expected in "$@"; do
    if [[ "$LAST_STATUS" == "$expected" ]]; then
      found=1
      break
    fi
  done
  if [[ "$found" -ne 1 ]]; then
    fail "Statut HTTP inattendu: ${LAST_STATUS} (attendus: $*)"
  fi
}

test_api() {
  local libelle="$1"
  local method="$2"
  local path="$3"
  local cookie_file="$4"
  local data="${5:-}"
  local csrf="${6:-}"
  shift 6
  local expected=("$@")

  log_step "$libelle -> ${method} ${path}"
  call_api "$method" "$path" "$cookie_file" "$data" "$csrf"
  expect_one_of "${expected[@]}"
  PASS_COUNT=$((PASS_COUNT + 1))
}

ensure_server() {
  if ! curl -fsS "${BASE_URL}/api/sante" >/dev/null 2>&1; then
    fail "Backend indisponible sur ${BASE_URL}. Demarre-le puis relance."
  fi
}

random_digits7() {
  printf '%07d' $((RANDOM % 10000000))
}

ensure_server

GUEST_COOKIE="$(new_tmp)"
ADMIN_COOKIE="$(new_tmp)"
ADMIN_ALIAS_COOKIE="$(new_tmp)"

test_api "Public sante" GET "/api/sante" "$GUEST_COOKIE" "" "" 200
test_api "Public swagger json" GET "/api/documentation" "$GUEST_COOKIE" "" "" 200
test_api "Public pending-check" POST "/api/auth/pending-check" "$GUEST_COOKIE" "{}" "" 200 403
test_api "Public sign cloudinary" POST "/api/sign" "$GUEST_COOKIE" "{\"folder\":\"tests\"}" "" 200 500

test_api "Login ADMIN (authContext)" POST "/api/authContext/login" "$ADMIN_COOKIE" \
  "{\"identifiant\":\"${ADMIN_IDENTIFIANT}\",\"motDePasse\":\"${ADMIN_MOT_DE_PASSE}\"}" "" 200
ADMIN_CSRF="$(csrf_from_cookie "$ADMIN_COOKIE")"
[[ -n "$ADMIN_CSRF" ]] || fail "CSRF ADMIN manquant"

test_api "Login ADMIN (alias /api/auth/login)" POST "/api/auth/login" "$ADMIN_ALIAS_COOKIE" \
  "{\"identifiant\":\"${ADMIN_IDENTIFIANT}\",\"motDePasse\":\"${ADMIN_MOT_DE_PASSE}\"}" "" 200
ADMIN_ALIAS_CSRF="$(csrf_from_cookie "$ADMIN_ALIAS_COOKIE")"
[[ -n "$ADMIN_ALIAS_CSRF" ]] || fail "CSRF alias ADMIN manquant"
test_api "Session alias /api/auth/session" GET "/api/auth/session" "$ADMIN_ALIAS_COOKIE" "" "" 200
test_api "Logout alias /api/auth/logout" POST "/api/auth/logout" "$ADMIN_ALIAS_COOKIE" "{}" "$ADMIN_ALIAS_CSRF" 200

test_api "Contexte ADMIN" GET "/api/authContext" "$ADMIN_COOKIE" "" "" 200
ADMIN_ROLE="$(read_json_path "$LAST_BODY" "user.role")"
[[ "$ADMIN_ROLE" == "ADMIN" ]] || fail "Role ADMIN attendu, recu=${ADMIN_ROLE}"

test_api "Refresh ADMIN" POST "/api/authContext/rafraichir" "$ADMIN_COOKIE" "{}" "$ADMIN_CSRF" 200
ADMIN_CSRF="$(csrf_from_cookie "$ADMIN_COOKIE")"
[[ -n "$ADMIN_CSRF" ]] || fail "CSRF ADMIN manquant apres refresh"

CLIENT_PHONE="77$(random_digits7)"
CLIENT_EMAIL="client.$(date +%s)@kya.local"
CLIENT_CREATE="$(node -e 'console.log(JSON.stringify({firstName: process.argv[1], lastName: process.argv[2], phone: process.argv[3], email: process.argv[4], status: "active"}))' "Client" "Test" "$CLIENT_PHONE" "$CLIENT_EMAIL")"
test_api "Clients list" GET "/api/clients" "$ADMIN_COOKIE" "" "" 200
test_api "Clients create" POST "/api/clients" "$ADMIN_COOKIE" "$CLIENT_CREATE" "$ADMIN_CSRF" 200
CLIENT_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$CLIENT_ID" ]] || fail "ID client manquant"
test_api "Client get" GET "/api/clients/${CLIENT_ID}" "$ADMIN_COOKIE" "" "" 200
test_api "Client put" PUT "/api/clients/${CLIENT_ID}" "$ADMIN_COOKIE" "{\"firstName\":\"ClientMaj\"}" "$ADMIN_CSRF" 200
test_api "Client patch" PATCH "/api/clients/${CLIENT_ID}" "$ADMIN_COOKIE" "{\"status\":\"archived\"}" "$ADMIN_CSRF" 200

LOCATION_CREATE="$(node -e 'console.log(JSON.stringify({clientId: process.argv[1], propertyType: "apartment", propertyName: "Appartement Test", monthlyRent: 120000, startDate: "2026-01-01T00:00:00.000Z"}))' "$CLIENT_ID")"
test_api "Locations list" GET "/api/locations" "$ADMIN_COOKIE" "" "" 200
test_api "Location create" POST "/api/locations" "$ADMIN_COOKIE" "$LOCATION_CREATE" "$ADMIN_CSRF" 200
LOCATION_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$LOCATION_ID" ]] || fail "ID location manquant"
test_api "Location get" GET "/api/locations/${LOCATION_ID}" "$ADMIN_COOKIE" "" "" 200
test_api "Location put" PUT "/api/locations/${LOCATION_ID}" "$ADMIN_COOKIE" "{\"propertyName\":\"Appartement Test MAJ\"}" "$ADMIN_CSRF" 200
test_api "Location patch" PATCH "/api/locations/${LOCATION_ID}" "$ADMIN_COOKIE" "{\"monthlyRent\":130000}" "$ADMIN_CSRF" 200

DOC_CREATE="$(node -e 'console.log(JSON.stringify({name: "Contrat Test", type: "contract", url: "https://example.com/contrat-test"}))')"
test_api "Documents list" GET "/api/documents" "$ADMIN_COOKIE" "" "" 200
test_api "Document create" POST "/api/documents" "$ADMIN_COOKIE" "$DOC_CREATE" "$ADMIN_CSRF" 200
DOC_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$DOC_ID" ]] || fail "ID document manquant"
test_api "Document get" GET "/api/documents/${DOC_ID}" "$ADMIN_COOKIE" "" "" 200
test_api "Document put" PUT "/api/documents/${DOC_ID}" "$ADMIN_COOKIE" "{\"name\":\"Contrat Test MAJ\"}" "$ADMIN_CSRF" 200
test_api "Document patch" PATCH "/api/documents/${DOC_ID}" "$ADMIN_COOKIE" "{\"signed\":true}" "$ADMIN_CSRF" 200

PAY_CREATE="$(node -e 'console.log(JSON.stringify({amount: 10000, date: "2026-02-01T00:00:00.000Z", receiptNumber: "REC-TEST-001", description: "Paiement test"}))')"
test_api "Payments list" GET "/api/payments" "$ADMIN_COOKIE" "" "" 200
test_api "Payment create" POST "/api/payments" "$ADMIN_COOKIE" "$PAY_CREATE" "$ADMIN_CSRF" 200
PAY_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$PAY_ID" ]] || fail "ID paiement manquant"
test_api "Payment get" GET "/api/payments/${PAY_ID}" "$ADMIN_COOKIE" "" "" 200
test_api "Payment put" PUT "/api/payments/${PAY_ID}" "$ADMIN_COOKIE" "{\"amount\":12000}" "$ADMIN_CSRF" 200
test_api "Payment patch" PATCH "/api/payments/${PAY_ID}" "$ADMIN_COOKIE" "{\"description\":\"Paiement patch\"}" "$ADMIN_CSRF" 200

DEPOT_CREATE="$(node -e 'console.log(JSON.stringify({amount: 5000, date: "2026-02-01T00:00:00.000Z", receiptNumber: "DEP-TEST-001", description: "Depot test"}))')"
test_api "Depots list" GET "/api/deposits" "$ADMIN_COOKIE" "" "" 200
test_api "Depot create" POST "/api/deposits" "$ADMIN_COOKIE" "$DEPOT_CREATE" "$ADMIN_CSRF" 200
DEPOT_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$DEPOT_ID" ]] || fail "ID depot manquant"
test_api "Depot get" GET "/api/deposits/${DEPOT_ID}" "$ADMIN_COOKIE" "" "" 200
test_api "Depot put" PUT "/api/deposits/${DEPOT_ID}" "$ADMIN_COOKIE" "{\"amount\":6500}" "$ADMIN_CSRF" 200
test_api "Depot patch" PATCH "/api/deposits/${DEPOT_ID}" "$ADMIN_COOKIE" "{\"description\":\"Depot patch\"}" "$ADMIN_CSRF" 200

WORK_CREATE="$(node -e 'console.log(JSON.stringify({title: "Travail Test", description: "Desc", priority: "medium", status: "pending"}))')"
test_api "Work items list" GET "/api/work_items" "$ADMIN_COOKIE" "" "" 200
test_api "Work item create" POST "/api/work_items" "$ADMIN_COOKIE" "$WORK_CREATE" "$ADMIN_CSRF" 200
WORK_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$WORK_ID" ]] || fail "ID work item manquant"
test_api "Work item get" GET "/api/work_items/${WORK_ID}" "$ADMIN_COOKIE" "" "" 200
test_api "Work item put" PUT "/api/work_items/${WORK_ID}" "$ADMIN_COOKIE" "{\"title\":\"Travail MAJ\"}" "$ADMIN_CSRF" 200
test_api "Work item patch" PATCH "/api/work_items/${WORK_ID}" "$ADMIN_COOKIE" "{\"status\":\"completed\"}" "$ADMIN_CSRF" 200

test_api "Settings list" GET "/api/settings" "$ADMIN_COOKIE" "" "" 200
test_api "Setting create" POST "/api/settings" "$ADMIN_COOKIE" "{\"key\":\"test.key\",\"value\":\"test.value\"}" "$ADMIN_CSRF" 200
SETTING_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$SETTING_ID" ]] || fail "ID setting manquant"
test_api "Setting put" PUT "/api/settings/${SETTING_ID}" "$ADMIN_COOKIE" "{\"value\":\"v2\"}" "$ADMIN_CSRF" 200
test_api "Setting patch" PATCH "/api/settings/${SETTING_ID}" "$ADMIN_COOKIE" "{\"value\":\"v3\"}" "$ADMIN_CSRF" 200

IMPORT_CREATE="$(node -e 'console.log(JSON.stringify({fileName: "import-test.xlsx", totalRows: 1, inserted: [], errors: []}))')"
test_api "Import runs list" GET "/api/import_runs" "$ADMIN_COOKIE" "" "" 200
test_api "Import run create" POST "/api/import_runs" "$ADMIN_COOKIE" "$IMPORT_CREATE" "$ADMIN_CSRF" 200
IMPORT_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$IMPORT_ID" ]] || fail "ID import run manquant"
test_api "Import run get" GET "/api/import_runs/${IMPORT_ID}" "$ADMIN_COOKIE" "" "" 200
test_api "Import run put" PUT "/api/import_runs/${IMPORT_ID}" "$ADMIN_COOKIE" "{\"ignored\":true}" "$ADMIN_CSRF" 200
test_api "Import run patch" PATCH "/api/import_runs/${IMPORT_ID}" "$ADMIN_COOKIE" "{\"readErrors\":true}" "$ADMIN_CSRF" 200

test_api "Notifications list" GET "/api/notifications" "$ADMIN_COOKIE" "" "" 200
test_api "Notification patch (not found attendu)" PATCH "/api/notifications/fake-notification-id" "$ADMIN_COOKIE" "{}" "$ADMIN_CSRF" 404

test_api "Undo actions list" GET "/api/undo-actions?limit=20" "$ADMIN_COOKIE" "" "" 200
UNDO_ID="$(read_json_path "$LAST_BODY" "0.id")"
if [[ -n "$UNDO_ID" ]]; then
  test_api "Undo rollback" POST "/api/undo-actions/${UNDO_ID}/rollback" "$ADMIN_COOKIE" "{}" "$ADMIN_CSRF" 200
else
  test_api "Undo rollback (not found)" POST "/api/undo-actions/fake-undo-id/rollback" "$ADMIN_COOKIE" "{}" "$ADMIN_CSRF" 404
fi

test_api "Admin payments status" GET "/api/admin_payments/status" "$ADMIN_COOKIE" "" "" 200
test_api "Admin payments list" GET "/api/admin_payments" "$ADMIN_COOKIE" "" "" 200
test_api "Admin payment create" POST "/api/admin_payments" "$ADMIN_COOKIE" "{\"amount\":1000,\"method\":\"wave\",\"status\":\"pending\"}" "$ADMIN_CSRF" 200
ADMIN_PAYMENT_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$ADMIN_PAYMENT_ID" ]] || fail "ID admin payment manquant"
test_api "Admin payment get" GET "/api/admin_payments/${ADMIN_PAYMENT_ID}" "$ADMIN_COOKIE" "" "" 200
test_api "Admin payment put" PUT "/api/admin_payments/${ADMIN_PAYMENT_ID}" "$ADMIN_COOKIE" "{\"amount\":1500}" "$ADMIN_CSRF" 200
test_api "Admin payment patch" PATCH "/api/admin_payments/${ADMIN_PAYMENT_ID}" "$ADMIN_COOKIE" "{\"status\":\"paid\"}" "$ADMIN_CSRF" 200

test_api "Audit logs list" GET "/api/audit_logs" "$ADMIN_COOKIE" "" "" 200
test_api "Audit log create" POST "/api/audit_logs" "$ADMIN_COOKIE" "{\"actor\":\"admin\",\"action\":\"TEST\",\"message\":\"audit test\"}" "$ADMIN_CSRF" 200
AUDIT_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$AUDIT_ID" ]] || fail "ID audit log manquant"
test_api "Audit log get" GET "/api/audit_logs/${AUDIT_ID}" "$ADMIN_COOKIE" "" "" 200

BLOCKED_IP="10.66.$((RANDOM % 200 + 1)).$((RANDOM % 200 + 1))"
test_api "Blocked IPs list" GET "/api/blocked_ips" "$ADMIN_COOKIE" "" "" 200
test_api "Blocked IP create" POST "/api/blocked_ips" "$ADMIN_COOKIE" "{\"ip\":\"${BLOCKED_IP}\",\"reason\":\"test\"}" "$ADMIN_CSRF" 200
BLOCKED_IP_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$BLOCKED_IP_ID" ]] || fail "ID blocked IP manquant"
test_api "Blocked IP get" GET "/api/blocked_ips/${BLOCKED_IP_ID}" "$ADMIN_COOKIE" "" "" 200

test_api "Cloudinary open-url" POST "/api/cloudinary/open-url" "$ADMIN_COOKIE" "{\"url\":\"https://res.cloudinary.com/demo/image/upload/sample.jpg\"}" "$ADMIN_CSRF" 200

test_api "Supervision admins refuse ADMIN" GET "/api/admins" "$ADMIN_COOKIE" "" "" 403
test_api "Supervision admin_requests refuse ADMIN" GET "/api/admin_requests" "$ADMIN_COOKIE" "" "" 403
test_api "Supervision entreprises refuse ADMIN" GET "/api/entreprises" "$ADMIN_COOKIE" "" "" 403
test_api "Supervision users refuse ADMIN" GET "/api/users" "$ADMIN_COOKIE" "" "" 403
test_api "Securite audits refuse ADMIN" GET "/api/securite/audits?limite=10" "$ADMIN_COOKIE" "" "" 403
test_api "Rapport hebdo SUPER_ADMIN refuse ADMIN" GET "/api/securite/super-admin/rapport-hebdo?envoyer=false" "$ADMIN_COOKIE" "" "" 403
test_api "Relances impayes clients reserve SUPER_ADMIN" GET "/api/notifications/clients/impayes?dryRun=true&limit=20" "$ADMIN_COOKIE" "" "" 403

test_api "Blocked IP delete" DELETE "/api/blocked_ips/${BLOCKED_IP_ID}" "$ADMIN_COOKIE" "" "$ADMIN_CSRF" 200
test_api "Audit log delete" DELETE "/api/audit_logs/${AUDIT_ID}" "$ADMIN_COOKIE" "" "$ADMIN_CSRF" 200
test_api "Admin payment delete" DELETE "/api/admin_payments/${ADMIN_PAYMENT_ID}" "$ADMIN_COOKIE" "" "$ADMIN_CSRF" 200
test_api "Work item delete" DELETE "/api/work_items/${WORK_ID}" "$ADMIN_COOKIE" "" "$ADMIN_CSRF" 200
test_api "Depot delete" DELETE "/api/deposits/${DEPOT_ID}" "$ADMIN_COOKIE" "" "$ADMIN_CSRF" 200
test_api "Payment delete" DELETE "/api/payments/${PAY_ID}" "$ADMIN_COOKIE" "" "$ADMIN_CSRF" 200
test_api "Document delete" DELETE "/api/documents/${DOC_ID}" "$ADMIN_COOKIE" "" "$ADMIN_CSRF" 200
test_api "Location delete" DELETE "/api/locations/${LOCATION_ID}" "$ADMIN_COOKIE" "" "$ADMIN_CSRF" 200
test_api "Client delete" DELETE "/api/clients/${CLIENT_ID}" "$ADMIN_COOKIE" "" "$ADMIN_CSRF" 200
test_api "Setting delete" DELETE "/api/settings/${SETTING_ID}" "$ADMIN_COOKIE" "" "$ADMIN_CSRF" 200

test_api "Logout ADMIN authContext" POST "/api/authContext/logout" "$ADMIN_COOKIE" "{}" "$ADMIN_CSRF" 200

printf '\nSUCCES: %d checks API ADMIN executes sur %s.\n' "$PASS_COUNT" "$BASE_URL"
