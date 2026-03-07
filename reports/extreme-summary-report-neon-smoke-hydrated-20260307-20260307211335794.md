# Rapport Extreme Performance / Securite / Scalabilite

- Tag scenario: `neon-smoke-hydrated-20260307`
- Genere le: 2026-03-07T21:13:35.794Z

## Seed

- Debut: 2026-03-07T21:12:15.201Z
- Fin: 2026-03-07T21:12:36.551Z
- Admins simules: 1
- Clients par admin: 12
- Total clients cibles: 12

## Base de donnees

- utilisateurs: 14
- admins: 1
- entreprises: 1
- clients: 12
- locations: 12
- documents: 24
- paiementsMensuels: 24
- transactionsPaiement: 21
- depots: 12
- notifications: 14
- journauxAuditUtilisateur: 36
- journauxAuditAdmin: 78
- blockedIps: 3
- sessions: 12
- refreshTokens: 12
- tentativesConnexionEchouees: 0
- tentativesConnexionReussies: 24
- paiementsAbonnementAdmin: 2
- statutsAbonnementAdmin: 2

### Distribution statuts clients
- active: 8
- pending_validation: 2
- blocked: 1
- suspended: 1

### Distribution paiements mensuels
- paid: 6
- partial: 5
- processing: 4
- late: 3
- unpaid: 3
- refunded: 2
- cancelled: 1

## Charge et securite

- Base URL: http://localhost:3100
- Duree suite: 55040 ms
- Total requetes: 253
- Succes: 253
- Erreurs: 0

### Scenarios
- read_mix: req=30, ok=30, ko=0, p95=3988.24 ms, max=5919.95 ms
- document_write_mix: req=6, ok=6, ko=0, p95=4804.86 ms, max=4804.86 ms
- protected_route_without_auth: req=12, ok=12, ko=0, p95=166.69 ms, max=166.69 ms
- bad_csrf_write: req=12, ok=12, ko=0, p95=112.82 ms, max=112.82 ms
- tampered_payment: req=12, ok=12, ko=0, p95=3888.56 ms, max=3888.56 ms
- brute_force_login: req=12, ok=12, ko=0, p95=3675.12 ms, max=3675.12 ms
- logout_token_reuse: req=4, ok=4, ko=0, p95=2967.45 ms, max=2967.45 ms
- super_admin_without_second_auth: req=1, ok=1, ko=0, p95=3396.44 ms, max=3396.44 ms
- stress_mix: req=40, ok=40, ko=0, p95=2647.96 ms, max=3466.78 ms

### Chaos
- server_stop_restart: ignore (Chaos hook non configure)
- database_break_restore: ignore (Chaos hook non configure)

### Requetes les plus lentes
- GET /api/clients: 5919.95 ms (status 200)
- POST /api/documents: 4804.86 ms (status 200)
- POST /api/documents: 4603.11 ms (status 200)
- GET /api/admin_payments/status: 3988.24 ms (status 200)
- GET /api/documents: 3896.57 ms (status 200)
- POST /api/admin_payments: 3888.56 ms (status 400)
- POST /api/authContext/login: 3675.12 ms (status 401)
- POST /api/authContext/login: 3663.39 ms (status 401)
- POST /api/authContext/login: 3574 ms (status 401)
- POST /api/authContext/login: 3567.88 ms (status 401)

## Conclusion

- Le dispositif couvre generation massive de donnees, tentatives de brute force, acces non autorises, charge lecture/ecriture, stress et hooks chaos optionnels.
- Pour un test a tres haute intensite (1000 a 10000 sessions actives), augmente les parametres du runner et execute la suite sur une machine dediee.
