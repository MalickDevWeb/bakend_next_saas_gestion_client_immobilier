# Guide Module Admin De A A Z

Ce guide decrit uniquement le module **ADMIN** (hors ecrans super-admin).

Objectif:
- montrer le flux exact backend pour les fonctionnalites admin du frontend;
- donner la liste des endpoints utilises;
- expliquer comment tester rapidement et sans ambiguite.

## 1. Regle metier du module

- Un compte `ADMIN` utilise une authentification simple (1FA).
- Un `SUPER_ADMIN` peut agir sur le module admin **uniquement via impersonation**.
- Sans impersonation active, le `SUPER_ADMIN` n accede pas aux routes admin metier.
- Chaque route admin passe par:
  - validation de session;
  - verification de permission;
  - CSRF sur toutes les mutations (`POST/PUT/PATCH/DELETE`).

## 2. Architecture appliquee

Flux applique dans le code:

1. Route HTTP (`app/api/**`)
2. Controleur (`src/controleurs/ControleurAdministrationAdmin.ts`)
3. Facade applicative courte (`src/application/services/administration/ServiceAdministrationAdmin.ts`)
4. Facade metier courte (`src/application/services/administration/ServiceAdministrationAdminMetier.ts`)
5. Composant operations admin (`src/application/services/administration/ServiceAdministrationAdminOperations.ts`)
6. DAO (interfaces domaine)
7. DAO memoire/prisma (infrastructure)

Points importants:
- pas de logique metier dans les routes;
- pas de Prisma direct dans le service admin;
- gestion d erreurs centralisee via `executerAvecGestionErreurs`.

## 3. Fichiers principaux du module admin

- Routes API:
  - `app/api/clients/**`
  - `app/api/documents/**`
  - `app/api/payments/**`
  - `app/api/deposits/**`
  - `app/api/work_items/**`
  - `app/api/settings/**`
  - `app/api/import_runs/**`
  - `app/api/notifications/**`
  - `app/api/undo-actions/**`
  - `app/api/admin_payments/**`
  - `app/api/audit_logs/**`
  - `app/api/blocked_ips/**`
  - `app/api/cloudinary/open-url/route.ts`
- Controleur:
  - `src/controleurs/ControleurAdministrationAdmin.ts`
- Service:
  - `src/application/services/administration/ServiceAdministrationAdmin.ts`
  - `src/application/services/administration/ServiceAdministrationAdminMetier.ts`
  - `src/application/services/administration/ServiceAdministrationAdminOperations.ts`
- Entetes undo:
  - `src/infrastructure/http/appliquerEntetesAnnulation.ts`
- Cablage DI:
  - `src/coeur/conteneur/ConteneurDependances.ts`

## 4. Endpoints couverts

Le frontend admin consomme ces endpoints:

- CRUD:
  - `/clients`
  - `/documents`
  - `/payments`
  - `/deposits`
  - `/work_items`
  - `/settings`
  - `/import_runs`
  - `/admin_payments`
  - `/audit_logs`
  - `/blocked_ips`
- Lecture/mutation specifiques:
  - `/notifications` + `/notifications/{id}` (PATCH lue)
  - `/undo-actions` + `/undo-actions/{id}/rollback`
  - `/admin_payments/status`
  - `/cloudinary/open-url`

Routes alias sans prefixe `/api` existent aussi pour compatibilite frontend.

## 5. Permissions appliquees par ressource

Dans `ServiceAdministrationAdmin`, chaque ressource mappe une permission:

- clients -> `CLIENTS_GERER`
- documents -> `DOCUMENTS_GERER`
- payments/deposits/admin_payments -> `PAIEMENTS_GERER`
- work_items -> `TRAVAUX_GERER`
- settings/audit_logs/blocked_ips/undo-actions -> `PARAMETRES_GERER`
- import_runs -> `IMPORTS_GERER`
- notifications -> `NOTIFICATIONS_GERER`
- cloudinary -> `DOCUMENTS_GERER`

## 6. Undo (annulation)

Chaque mutation retournera des headers:

- `x-undo-id`
- `x-undo-expires-at`
- `x-undo-resource`
- `x-undo-resource-id`

Le frontend lit ces headers et peut appeler:
- `POST /undo-actions/{id}/rollback`

## 7. Test rapide (curl)

### 7.1 Login admin

```bash
curl -i -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"identifiant":"771234568","motDePasse":"Admin@123456"}' \
  https://bakend-next-saas-gestion-client.onrender.com/api/authContext/login
```

### 7.2 Lire clients

```bash
curl -i -b cookies.txt \
  https://bakend-next-saas-gestion-client.onrender.com/api/clients
```

### 7.3 Mutation avec CSRF

```bash
CSRF=$(awk '$6=="kya_csrf_token"{print $7}' cookies.txt | tail -n 1)

curl -i -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF" \
  -X POST \
  -d '{"id":"tmp-1","firstName":"Awa","lastName":"Diop","phone":"771234567","cni":"1234567890123"}' \
  https://bakend-next-saas-gestion-client.onrender.com/api/clients
```

### 7.4 Rollback

Recuperer `x-undo-id` de la reponse precedente puis:

```bash
UNDO_ID="COLLER_UNDO_ID"
curl -i -b cookies.txt \
  -H "x-csrf-token: $CSRF" \
  -X POST \
  https://bakend-next-saas-gestion-client.onrender.com/api/undo-actions/$UNDO_ID/rollback
```

## 8. Verification Swagger

Swagger est accessible via:
- `/documentation` (UI)
- `/api/documentation` (JSON)

Tag a verifier:
- `Administration Admin`

## 9. Check final avant de dormir

Executer:

```bash
npx tsc --noEmit
npm run lint
```

Puis valider en UI:
- login admin;
- liste clients;
- creation client;
- undo;
- paiements admin;
- notifications;
- settings.
