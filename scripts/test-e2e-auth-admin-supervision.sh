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

BASE_URL="${BASE_URL:-http://localhost:3000}"
ADMIN_IDENTIFIANT="${ADMIN_IDENTIFIANT:-${SEED_ADMIN_TELEPHONE:-${SEED_ADMIN_EMAIL:-771234568}}}"
ADMIN_MOT_DE_PASSE="${ADMIN_MOT_DE_PASSE:-${SEED_ADMIN_MOT_DE_PASSE:-Admin@123456}}"
SUPER_ADMIN_IDENTIFIANT="${SUPER_ADMIN_IDENTIFIANT:-${SEED_SUPER_ADMIN_EMAIL:-${SEED_SUPER_ADMIN_TELEPHONE:-superadmin@kya.local}}}"
SUPER_ADMIN_MOT_DE_PASSE="${SUPER_ADMIN_MOT_DE_PASSE:-${SEED_SUPER_ADMIN_MOT_DE_PASSE:-SuperAdmin@123456}}"

TMP_FILES=()
LAST_BODY=""
LAST_HEADERS=""
LAST_STATUS=""
SERVER_PID=""
STARTED_SERVER=0

new_tmp() {
  local file
  file="$(mktemp)"
  TMP_FILES+=("$file")
  printf '%s' "$file"
}

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

cleanup() {
  local code=$?
  for file in "${TMP_FILES[@]}"; do
    rm -f "$file"
  done
  if [[ "$STARTED_SERVER" -eq 1 && -n "$SERVER_PID" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
  exit $code
}
trap cleanup EXIT

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

expect_status() {
  local expected="$1"
  if [[ "$LAST_STATUS" != "$expected" ]]; then
    fail "Statut HTTP attendu=${expected}, recu=${LAST_STATUS}"
  fi
}

ensure_server() {
  if curl -fsS "${BASE_URL}/api/sante" >/dev/null 2>&1; then
    return
  fi

  local node_major node_minor
  node_major="$(node -p 'process.versions.node.split(".")[0]')"
  node_minor="$(node -p 'process.versions.node.split(".")[1]')"
  if [[ "$node_major" -lt 20 ]] || { [[ "$node_major" -eq 20 ]] && [[ "$node_minor" -lt 9 ]]; }; then
    fail "Serveur non joignable et Node local=$(node -v) insuffisant pour Next 16 (>=20.9). Demarre le backend avec Node 20+ puis relance ce script."
  fi

  log_step "Demarrage serveur dev (next dev)"
  npm run dev >/tmp/next-backend-dev.log 2>&1 &
  SERVER_PID="$!"
  STARTED_SERVER=1

  for _ in $(seq 1 90); do
    if curl -fsS "${BASE_URL}/api/sante" >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done

  tail -n 120 /tmp/next-backend-dev.log || true
  fail "Serveur indisponible sur ${BASE_URL}"
}

random_digits7() {
  printf '%07d' $((RANDOM % 10000000))
}

ADMIN_COOKIE="$(new_tmp)"
SUPER_COOKIE="$(new_tmp)"

ensure_server

log_step "ADMIN login"
call_api \
  POST \
  "/api/authContext/login" \
  "$ADMIN_COOKIE" \
  "{\"identifiant\":\"${ADMIN_IDENTIFIANT}\",\"motDePasse\":\"${ADMIN_MOT_DE_PASSE}\"}"
expect_status 200
ADMIN_CSRF="$(csrf_from_cookie "$ADMIN_COOKIE")"
[[ -n "$ADMIN_CSRF" ]] || fail "Cookie CSRF ADMIN absent apres login"

log_step "ADMIN contexte"
call_api GET "/api/authContext" "$ADMIN_COOKIE"
expect_status 200
ADMIN_USER_ID="$(read_json_path "$LAST_BODY" "user.id")"
ADMIN_USERNAME_CTX="$(read_json_path "$LAST_BODY" "user.username")"
ADMIN_EMAIL_CTX="$(read_json_path "$LAST_BODY" "user.email")"
ADMIN_ROLE="$(read_json_path "$LAST_BODY" "user.role")"
[[ "$ADMIN_ROLE" == "ADMIN" ]] || fail "Role ADMIN attendu, recu=${ADMIN_ROLE}"
ADMIN_2FA_REQ="$(read_json_path "$LAST_BODY" "user.superAdminSecondAuthRequired")"
[[ "$ADMIN_2FA_REQ" == "false" ]] || fail "superAdminSecondAuthRequired=false attendu pour ADMIN"

log_step "ADMIN refuse sur endpoint supervision"
call_api GET "/api/admins" "$ADMIN_COOKIE"
expect_status 403

log_step "ADMIN autorise sur endpoint metier"
call_api GET "/api/clients" "$ADMIN_COOKIE"
expect_status 200

log_step "SUPER_ADMIN login"
call_api \
  POST \
  "/api/authContext/login" \
  "$SUPER_COOKIE" \
  "{\"identifiant\":\"${SUPER_ADMIN_IDENTIFIANT}\",\"motDePasse\":\"${SUPER_ADMIN_MOT_DE_PASSE}\"}"
expect_status 200
SUPER_CSRF="$(csrf_from_cookie "$SUPER_COOKIE")"
[[ -n "$SUPER_CSRF" ]] || fail "Cookie CSRF SUPER_ADMIN absent apres login"

log_step "SUPER_ADMIN contexte initial"
call_api GET "/api/authContext" "$SUPER_COOKIE"
expect_status 200
SUPER_ROLE="$(read_json_path "$LAST_BODY" "user.role")"
[[ "$SUPER_ROLE" == "SUPER_ADMIN" ]] || fail "Role SUPER_ADMIN attendu, recu=${SUPER_ROLE}"

log_step "SUPER_ADMIN bloque avant second-auth"
call_api GET "/api/admins" "$SUPER_COOKIE"
expect_status 403

log_step "SUPER_ADMIN second-auth (mot de passe)"
call_api \
  POST \
  "/api/authContext/super-admin/second-auth" \
  "$SUPER_COOKIE" \
  "{\"motDePasse\":\"${SUPER_ADMIN_MOT_DE_PASSE}\"}" \
  "$SUPER_CSRF"
expect_status 200

log_step "SUPER_ADMIN supervision liste admins"
call_api GET "/api/admins" "$SUPER_COOKIE"
expect_status 200
TARGET_ADMIN_RAW="$(
  node - "$LAST_BODY" "$ADMIN_USER_ID" "$ADMIN_USERNAME_CTX" "$ADMIN_EMAIL_CTX" "$ADMIN_IDENTIFIANT" <<'NODE'
const fs = require('node:fs')
const file = process.argv[2]
const adminUserId = String(process.argv[3] || '').trim()
const adminUsername = String(process.argv[4] || '').trim()
const adminEmail = String(process.argv[5] || '').trim().toLowerCase()
const adminIdentifiant = String(process.argv[6] || '').trim().toLowerCase()

const elements = JSON.parse(fs.readFileSync(file, 'utf8') || '[]')
if (!Array.isArray(elements) || elements.length === 0) {
  process.stdout.write('\t\t')
  process.exit(0)
}

const equals = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()

const strategies = [
  (admin) => adminUserId && String(admin.userId || '').trim() === adminUserId,
  (admin) => adminUsername && equals(admin.username, adminUsername),
  (admin) => adminEmail && equals(admin.email, adminEmail),
  (admin) => adminIdentifiant && (equals(admin.username, adminIdentifiant) || equals(admin.email, adminIdentifiant)),
]

let cible = null
for (const strategie of strategies) {
  cible = elements.find((element) => {
    try {
      return strategie(element)
    } catch {
      return false
    }
  })
  if (cible) break
}

if (!cible) {
  cible = elements.find((element) => String(element.status || '').toUpperCase() === 'ACTIF') || elements[0]
}

const id = String(cible?.id || '').trim()
const name = String(cible?.name || cible?.username || '').trim()
const userId = String(cible?.userId || '').trim()
process.stdout.write(`${id}\t${name}\t${userId}`)
NODE
)"
TARGET_ADMIN_ID="${TARGET_ADMIN_RAW%%$'\t'*}"
TARGET_ADMIN_REST="${TARGET_ADMIN_RAW#*$'\t'}"
TARGET_ADMIN_NAME="${TARGET_ADMIN_REST%%$'\t'*}"
TARGET_ADMIN_USER_ID="${TARGET_ADMIN_REST#*$'\t'}"
[[ -n "$TARGET_ADMIN_ID" ]] || fail "Aucun admin trouve pour test d'impersonation"
[[ -n "$TARGET_ADMIN_NAME" ]] || fail "Nom admin cible vide pour test d'impersonation"
if [[ -z "$TARGET_ADMIN_USER_ID" ]]; then
  TARGET_ADMIN_USER_ID="$TARGET_ADMIN_ID"
fi

log_step "SUPER_ADMIN impersonation"
IMPERSONATE_BODY="$(
  node -e 'console.log(JSON.stringify({adminId: process.argv[1], adminName: process.argv[2], userId: process.argv[3]}))' \
    "$TARGET_ADMIN_ID" \
    "$TARGET_ADMIN_NAME" \
    "$TARGET_ADMIN_USER_ID"
)"
call_api POST "/api/authContext/impersonate" "$SUPER_COOKIE" "$IMPERSONATE_BODY" "$SUPER_CSRF"
expect_status 200

call_api GET "/api/authContext" "$SUPER_COOKIE"
expect_status 200
IMPERSONATED_ID="$(read_json_path "$LAST_BODY" "impersonation.adminId")"
[[ "$IMPERSONATED_ID" == "$TARGET_ADMIN_ID" ]] || fail "Impersonation adminId inattendu"

log_step "SUPER_ADMIN clear impersonation"
call_api POST "/api/authContext/clear-impersonation" "$SUPER_COOKIE" "{}" "$SUPER_CSRF"
expect_status 200
call_api GET "/api/authContext" "$SUPER_COOKIE"
expect_status 200
IMPERSONATION_STATE="$(read_json_path "$LAST_BODY" "impersonation")"
[[ "$IMPERSONATION_STATE" == "null" ]] || fail "Impersonation devrait etre null apres clear"

log_step "SUPER_ADMIN second-auth refresh pour CRUD"
call_api \
  POST \
  "/api/authContext/super-admin/second-auth" \
  "$SUPER_COOKIE" \
  "{\"motDePasse\":\"${SUPER_ADMIN_MOT_DE_PASSE}\"}" \
  "$SUPER_CSRF"
expect_status 200

log_step "CRUD admin_requests"
REQ_SUFFIX="$(date +%s)"
REQ_PHONE="77$(random_digits7)"
REQ_BODY="$(node -e 'console.log(JSON.stringify({name: process.argv[1], email: process.argv[2], phone: process.argv[3], entrepriseName: process.argv[4], status: "EN_ATTENTE", username: process.argv[5], password: process.argv[6]}))' "Demande ${REQ_SUFFIX}" "demande.${REQ_SUFFIX}@kya.local" "$REQ_PHONE" "Entreprise Demande ${REQ_SUFFIX}" "$REQ_PHONE" "AdminReq@123456")"
call_api POST "/api/admin_requests" "$SUPER_COOKIE" "$REQ_BODY" "$SUPER_CSRF"
expect_status 200
REQ_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$REQ_ID" ]] || fail "Creation admin_request sans id"
call_api GET "/api/admin_requests/${REQ_ID}" "$SUPER_COOKIE"
expect_status 200
call_api DELETE "/api/admin_requests/${REQ_ID}" "$SUPER_COOKIE" "" "$SUPER_CSRF"
expect_status 200

log_step "CRUD entreprises"
ENT_BODY="$(node -e 'console.log(JSON.stringify({name: process.argv[1]}))' "Entreprise Test ${REQ_SUFFIX}")"
call_api POST "/api/entreprises" "$SUPER_COOKIE" "$ENT_BODY" "$SUPER_CSRF"
expect_status 200
ENT_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$ENT_ID" ]] || fail "Creation entreprise sans id"
call_api GET "/api/entreprises/${ENT_ID}" "$SUPER_COOKIE"
expect_status 200
call_api DELETE "/api/entreprises/${ENT_ID}" "$SUPER_COOKIE" "" "$SUPER_CSRF"
expect_status 200

log_step "CRUD users"
USER_DIGITS="$(random_digits7)"
USER_PHONE="77${USER_DIGITS}"
USER_EMAIL="user.test.${USER_DIGITS}@kya.local"
USER_BODY="$(node -e 'console.log(JSON.stringify({username: process.argv[1], name: process.argv[2], email: process.argv[3], phone: process.argv[4], role: "UTILISATEUR", status: "ACTIF", password: process.argv[5]}))' "$USER_PHONE" "User Test ${USER_DIGITS}" "$USER_EMAIL" "$USER_PHONE" "Password@123456")"
call_api POST "/api/users" "$SUPER_COOKIE" "$USER_BODY" "$SUPER_CSRF"
expect_status 200
USER_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$USER_ID" ]] || fail "Creation user sans id"
call_api GET "/api/users/${USER_ID}" "$SUPER_COOKIE"
expect_status 200
call_api DELETE "/api/users/${USER_ID}" "$SUPER_COOKIE" "" "$SUPER_CSRF"
expect_status 200

log_step "Tous les tests sont passes"
printf 'OK - Auth ADMIN/SUPER_ADMIN + supervision CRUD verifies sur %s\n' "$BASE_URL"
