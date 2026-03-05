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

SUPER_ADMIN_IDENTIFIANT="${SUPER_ADMIN_IDENTIFIANT:-${SEED_SUPER_ADMIN_EMAIL:-${SEED_SUPER_ADMIN_TELEPHONE:-superadmin@kya.local}}}"
SUPER_ADMIN_MOT_DE_PASSE="${SUPER_ADMIN_MOT_DE_PASSE:-${SEED_SUPER_ADMIN_MOT_DE_PASSE:-SuperAdmin@123456}}"

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

reauth_super_admin() {
  call_api \
    POST \
    "/api/authContext/super-admin/second-auth" \
    "$SUPER_COOKIE" \
    "{\"motDePasse\":\"${SUPER_ADMIN_MOT_DE_PASSE}\"}" \
    "$SUPER_CSRF"
  expect_one_of 200
  local csrf_actualise
  csrf_actualise="$(csrf_from_cookie "$SUPER_COOKIE")"
  if [[ -n "$csrf_actualise" ]]; then
    SUPER_CSRF="$csrf_actualise"
  fi
}

ensure_server

GUEST_COOKIE="$(new_tmp)"
SUPER_COOKIE="$(new_tmp)"

test_api "Public sante" GET "/api/sante" "$GUEST_COOKIE" "" "" 200
test_api "Public swagger json" GET "/api/documentation" "$GUEST_COOKIE" "" "" 200
test_api "Public pending-check" POST "/api/auth/pending-check" "$GUEST_COOKIE" "{}" "" 200 403
test_api "Public sign cloudinary" POST "/api/sign" "$GUEST_COOKIE" "{\"folder\":\"tests\"}" "" 200 500

test_api "Login SUPER_ADMIN (authContext)" POST "/api/authContext/login" "$SUPER_COOKIE" \
  "{\"identifiant\":\"${SUPER_ADMIN_IDENTIFIANT}\",\"motDePasse\":\"${SUPER_ADMIN_MOT_DE_PASSE}\"}" "" 200
SUPER_CSRF="$(csrf_from_cookie "$SUPER_COOKIE")"
[[ -n "$SUPER_CSRF" ]] || fail "CSRF SUPER_ADMIN manquant"

test_api "Contexte SUPER_ADMIN" GET "/api/authContext" "$SUPER_COOKIE" "" "" 200
SUPER_ROLE="$(read_json_path "$LAST_BODY" "user.role")"
[[ "$SUPER_ROLE" == "SUPER_ADMIN" ]] || fail "Role SUPER_ADMIN attendu, recu=${SUPER_ROLE}"

test_api "Login alias /api/auth/login" POST "/api/auth/login" "$SUPER_COOKIE" \
  "{\"identifiant\":\"${SUPER_ADMIN_IDENTIFIANT}\",\"motDePasse\":\"${SUPER_ADMIN_MOT_DE_PASSE}\"}" "" 200
SUPER_CSRF="$(csrf_from_cookie "$SUPER_COOKIE")"
[[ -n "$SUPER_CSRF" ]] || fail "CSRF SUPER_ADMIN manquant apres login alias"
test_api "Session alias /api/auth/session" GET "/api/auth/session" "$SUPER_COOKIE" "" "" 200

test_api "Refresh SUPER_ADMIN" POST "/api/authContext/rafraichir" "$SUPER_COOKIE" "{}" "$SUPER_CSRF" 200
SUPER_CSRF="$(csrf_from_cookie "$SUPER_COOKIE")"
[[ -n "$SUPER_CSRF" ]] || fail "CSRF SUPER_ADMIN manquant apres refresh"

test_api "TOTP statut SUPER_ADMIN" GET "/api/authContext/super-admin/totp/statut" "$SUPER_COOKIE" "" "" 200
test_api "TOTP initialiser SUPER_ADMIN" POST "/api/authContext/super-admin/totp/initialiser" "$SUPER_COOKIE" "{}" "$SUPER_CSRF" 200
SECRET_TEMP="$(read_json_path "$LAST_BODY" "secretTemporaire")"
[[ -n "$SECRET_TEMP" ]] || fail "secretTemporaire manquant"
test_api "TOTP activer (code invalide attendu)" POST "/api/authContext/super-admin/totp/activer" "$SUPER_COOKIE" \
  "{\"secretTemporaire\":\"${SECRET_TEMP}\",\"codeTotp\":\"000000\"}" "$SUPER_CSRF" 401 412

test_api "Supervision admins bloque avant second-auth" GET "/api/admins" "$SUPER_COOKIE" "" "" 403
test_api "Second-auth SUPER_ADMIN" POST "/api/authContext/super-admin/second-auth" "$SUPER_COOKIE" \
  "{\"motDePasse\":\"${SUPER_ADMIN_MOT_DE_PASSE}\"}" "$SUPER_CSRF" 200
test_api "Securite audits SUPER_ADMIN" GET "/api/securite/audits?limite=10" "$SUPER_COOKIE" "" "" 200
test_api "Rapport hebdo SUPER_ADMIN (preview)" GET "/api/securite/super-admin/rapport-hebdo?envoyer=false" "$SUPER_COOKIE" "" "" 200
test_api "Relances impayes clients (preview)" GET "/api/notifications/clients/impayes?dryRun=true&limit=20" "$SUPER_COOKIE" "" "" 200

reauth_super_admin
test_api "Supervision admins list" GET "/api/admins" "$SUPER_COOKIE" "" "" 200
TARGET_ADMIN_RAW="$(
  node - "$LAST_BODY" <<'NODE'
const fs = require('node:fs')
const file = process.argv[2]
const elements = JSON.parse(fs.readFileSync(file, 'utf8') || '[]')
if (!Array.isArray(elements) || elements.length === 0) {
  process.stdout.write('\t\t\t')
  process.exit(0)
}
const actif = elements.find((e) => String(e.status || '').toUpperCase() === 'ACTIF') || elements[0]
const id = String(actif?.id || '').trim()
const name = String(actif?.name || actif?.username || '').trim()
const username = String(actif?.username || '').trim()
const userId = String(actif?.userId || '').trim()
process.stdout.write(`${id}\t${name}\t${username}\t${userId}`)
NODE
)"
TARGET_ADMIN_ID="${TARGET_ADMIN_RAW%%$'\t'*}"
TARGET_REST="${TARGET_ADMIN_RAW#*$'\t'}"
TARGET_ADMIN_NAME="${TARGET_REST%%$'\t'*}"
TARGET_REST="${TARGET_REST#*$'\t'}"
TARGET_ADMIN_USERNAME="${TARGET_REST%%$'\t'*}"
TARGET_ADMIN_USER_ID="${TARGET_REST#*$'\t'}"
[[ -n "$TARGET_ADMIN_ID" ]] || fail "Aucun admin cible trouve"
[[ -n "$TARGET_ADMIN_NAME" ]] || TARGET_ADMIN_NAME="$TARGET_ADMIN_ID"
[[ -n "$TARGET_ADMIN_USERNAME" ]] || TARGET_ADMIN_USERNAME="$TARGET_ADMIN_ID"
[[ -n "$TARGET_ADMIN_USER_ID" ]] || TARGET_ADMIN_USER_ID="$TARGET_ADMIN_ID"

SUPER_USER_PHONE="77$(random_digits7)"
SUPER_USER_EMAIL="supervision.user.$(date +%s)@kya.local"
SUPER_USER_BODY="$(node -e 'console.log(JSON.stringify({username: process.argv[1], name: process.argv[2], email: process.argv[3], phone: process.argv[1], role: "UTILISATEUR", status: "ACTIF", password: "Password@123456"}))' "$SUPER_USER_PHONE" "User Supervision" "$SUPER_USER_EMAIL")"
reauth_super_admin
test_api "Supervision users list" GET "/api/users" "$SUPER_COOKIE" "" "" 200
reauth_super_admin
test_api "Supervision user create" POST "/api/users" "$SUPER_COOKIE" "$SUPER_USER_BODY" "$SUPER_CSRF" 200
SUPER_CREATED_USER_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$SUPER_CREATED_USER_ID" ]] || fail "Creation user supervision sans id"
reauth_super_admin
test_api "Supervision user get" GET "/api/users/${SUPER_CREATED_USER_ID}" "$SUPER_COOKIE" "" "" 200
reauth_super_admin
test_api "Supervision user put" PUT "/api/users/${SUPER_CREATED_USER_ID}" "$SUPER_COOKIE" "{\"name\":\"User Supervision MAJ\"}" "$SUPER_CSRF" 200
reauth_super_admin
test_api "Supervision user patch" PATCH "/api/users/${SUPER_CREATED_USER_ID}" "$SUPER_COOKIE" "{\"status\":\"SUSPENDU\"}" "$SUPER_CSRF" 200

SUPER_ADMIN_EMAIL_NEW="supervision.admin.$(date +%s)@kya.local"
SUPER_ADMIN_USERNAME="admin-supervision-$(date +%s)"
SUPER_ADMIN_BODY="$(node -e 'console.log(JSON.stringify({userId: process.argv[1], username: process.argv[2], name: "Admin Supervision", email: process.argv[3], status: "ACTIF", password: process.argv[4]}))' "$SUPER_CREATED_USER_ID" "$SUPER_ADMIN_USERNAME" "$SUPER_ADMIN_EMAIL_NEW" "Password@123456")"
reauth_super_admin
test_api "Supervision admin create" POST "/api/admins" "$SUPER_COOKIE" "$SUPER_ADMIN_BODY" "$SUPER_CSRF" 200
SUPER_CREATED_ADMIN_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$SUPER_CREATED_ADMIN_ID" ]] || fail "Creation admin supervision sans id"
reauth_super_admin
test_api "Supervision admin get" GET "/api/admins/${SUPER_CREATED_ADMIN_ID}" "$SUPER_COOKIE" "" "" 200
reauth_super_admin
test_api "Supervision admin put" PUT "/api/admins/${SUPER_CREATED_ADMIN_ID}" "$SUPER_COOKIE" "{\"name\":\"Admin Supervision MAJ\"}" "$SUPER_CSRF" 200
reauth_super_admin
test_api "Supervision admin patch" PATCH "/api/admins/${SUPER_CREATED_ADMIN_ID}" "$SUPER_COOKIE" "{\"status\":\"SUSPENDU\"}" "$SUPER_CSRF" 200

REQ_PHONE="77$(random_digits7)"
REQ_BODY="$(node -e 'console.log(JSON.stringify({name: process.argv[1], email: process.argv[2], phone: process.argv[3], entrepriseName: process.argv[4], status: "EN_ATTENTE", username: process.argv[5], password: "AdminReq@123456"}))' "Demande Supervision" "demande.supervision.$(date +%s)@kya.local" "$REQ_PHONE" "Entreprise Supervision" "$REQ_PHONE")"
reauth_super_admin
test_api "Supervision admin_requests list" GET "/api/admin_requests" "$SUPER_COOKIE" "" "" 200
reauth_super_admin
test_api "Supervision admin_request create" POST "/api/admin_requests" "$SUPER_COOKIE" "$REQ_BODY" "$SUPER_CSRF" 200
SUPER_REQ_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$SUPER_REQ_ID" ]] || fail "Creation demande admin sans id"
reauth_super_admin
test_api "Supervision admin_request get" GET "/api/admin_requests/${SUPER_REQ_ID}" "$SUPER_COOKIE" "" "" 200
reauth_super_admin
test_api "Supervision admin_request put" PUT "/api/admin_requests/${SUPER_REQ_ID}" "$SUPER_COOKIE" "{\"status\":\"ACTIF\"}" "$SUPER_CSRF" 200
reauth_super_admin
test_api "Supervision admin_request patch" PATCH "/api/admin_requests/${SUPER_REQ_ID}" "$SUPER_COOKIE" "{\"status\":\"SUSPENDU\"}" "$SUPER_CSRF" 200

ENT_BODY="$(node -e 'console.log(JSON.stringify({name: process.argv[1]}))' "Entreprise Supervision $(date +%s)")"
reauth_super_admin
test_api "Supervision entreprises list" GET "/api/entreprises" "$SUPER_COOKIE" "" "" 200
reauth_super_admin
test_api "Supervision entreprise create" POST "/api/entreprises" "$SUPER_COOKIE" "$ENT_BODY" "$SUPER_CSRF" 200
SUPER_ENT_ID="$(read_json_path "$LAST_BODY" "id")"
[[ -n "$SUPER_ENT_ID" ]] || fail "Creation entreprise supervision sans id"
reauth_super_admin
test_api "Supervision entreprise get" GET "/api/entreprises/${SUPER_ENT_ID}" "$SUPER_COOKIE" "" "" 200
reauth_super_admin
test_api "Supervision entreprise put" PUT "/api/entreprises/${SUPER_ENT_ID}" "$SUPER_COOKIE" "{\"name\":\"Entreprise Supervision MAJ\"}" "$SUPER_CSRF" 200
reauth_super_admin
test_api "Supervision entreprise patch" PATCH "/api/entreprises/${SUPER_ENT_ID}" "$SUPER_COOKIE" "{\"name\":\"Entreprise Supervision PATCH\"}" "$SUPER_CSRF" 200

test_api "Second-auth SUPER_ADMIN (avant impersonation)" POST "/api/authContext/super-admin/second-auth" "$SUPER_COOKIE" \
  "{\"motDePasse\":\"${SUPER_ADMIN_MOT_DE_PASSE}\"}" "$SUPER_CSRF" 200
reauth_super_admin
IMPERSONATE_BODY="$(node -e 'console.log(JSON.stringify({adminId: process.argv[1], adminName: process.argv[2], userId: process.argv[3]}))' "$TARGET_ADMIN_USER_ID" "$TARGET_ADMIN_NAME" "$TARGET_ADMIN_USER_ID")"
test_api "Impersonate SUPER_ADMIN -> ADMIN" POST "/api/authContext/impersonate" "$SUPER_COOKIE" \
  "$IMPERSONATE_BODY" "$SUPER_CSRF" 200
test_api "Contexte apres impersonation" GET "/api/authContext" "$SUPER_COOKIE" "" "" 200
IMPERSONATION_ADMIN_ID="$(read_json_path "$LAST_BODY" "impersonation.adminId")"
[[ "$IMPERSONATION_ADMIN_ID" == "$TARGET_ADMIN_USER_ID" ]] || fail "Impersonation adminId inattendu"

test_api "Endpoint scope ADMIN depuis SUPER_ADMIN impersonated" GET "/api/clients" "$SUPER_COOKIE" "" "" 200
reauth_super_admin
test_api "Clear impersonation" POST "/api/authContext/clear-impersonation" "$SUPER_COOKIE" "{}" "$SUPER_CSRF" 200

reauth_super_admin
test_api "Supervision admin delete" DELETE "/api/admins/${SUPER_CREATED_ADMIN_ID}" "$SUPER_COOKIE" "" "$SUPER_CSRF" 200
reauth_super_admin
test_api "Supervision user delete" DELETE "/api/users/${SUPER_CREATED_USER_ID}" "$SUPER_COOKIE" "" "$SUPER_CSRF" 200
reauth_super_admin
test_api "Supervision admin_request delete" DELETE "/api/admin_requests/${SUPER_REQ_ID}" "$SUPER_COOKIE" "" "$SUPER_CSRF" 200
reauth_super_admin
test_api "Supervision entreprise delete" DELETE "/api/entreprises/${SUPER_ENT_ID}" "$SUPER_COOKIE" "" "$SUPER_CSRF" 200

test_api "Logout alias /api/auth/logout" POST "/api/auth/logout" "$SUPER_COOKIE" "{}" "$SUPER_CSRF" 200
test_api "Login SUPER_ADMIN final (pour logout authContext)" POST "/api/authContext/login" "$SUPER_COOKIE" \
  "{\"identifiant\":\"${SUPER_ADMIN_IDENTIFIANT}\",\"motDePasse\":\"${SUPER_ADMIN_MOT_DE_PASSE}\"}" "" 200
SUPER_CSRF="$(csrf_from_cookie "$SUPER_COOKIE")"
[[ -n "$SUPER_CSRF" ]] || fail "CSRF SUPER_ADMIN manquant pour logout final"
test_api "Logout SUPER_ADMIN authContext" POST "/api/authContext/logout" "$SUPER_COOKIE" "{}" "$SUPER_CSRF" 200

printf '\nSUCCES: %d checks API SUPER_ADMIN executes sur %s.\n' "$PASS_COUNT" "$BASE_URL"
