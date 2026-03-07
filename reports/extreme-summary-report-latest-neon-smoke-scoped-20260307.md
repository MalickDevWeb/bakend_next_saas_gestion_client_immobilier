# Rapport Extreme Performance / Securite / Scalabilite

- Tag scenario: `neon-smoke-scoped-20260307`
- Genere le: 2026-03-07T20:58:55.521Z

## Seed

- Debut: 2026-03-07T20:57:51.827Z
- Fin: 2026-03-07T20:58:13.814Z
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
- active: 10
- blocked: 1
- pending_validation: 1

### Distribution paiements mensuels
- paid: 11
- cancelled: 3
- refunded: 3
- unpaid: 3
- partial: 2
- processing: 2

## Charge et securite

- Base URL: http://localhost:3100
- Duree suite: 38527 ms
- Total requetes: 253
- Succes: 253
- Erreurs: 0

### Scenarios
- read_mix: req=30, ok=30, ko=0, p95=3072.41 ms, max=3388.01 ms
- document_write_mix: req=6, ok=6, ko=0, p95=3372.01 ms, max=3372.01 ms
- protected_route_without_auth: req=12, ok=12, ko=0, p95=146.52 ms, max=146.52 ms
- bad_csrf_write: req=12, ok=12, ko=0, p95=100.76 ms, max=100.76 ms
- tampered_payment: req=12, ok=12, ko=0, p95=2117.34 ms, max=2117.34 ms
- brute_force_login: req=12, ok=12, ko=0, p95=2152.65 ms, max=2152.65 ms
- logout_token_reuse: req=4, ok=4, ko=0, p95=1359.45 ms, max=1359.45 ms
- super_admin_without_second_auth: req=1, ok=1, ko=0, p95=1426.04 ms, max=1426.04 ms
- stress_mix: req=40, ok=40, ko=0, p95=2022.78 ms, max=3539.27 ms

### Chaos
- server_stop_restart: ignore (Chaos hook non configure)
- database_break_restore: ignore (Chaos hook non configure)

### Requetes les plus lentes
- GET /api/clients: 3539.27 ms (status 200)
- GET /api/clients: 3388.01 ms (status 200)
- POST /api/documents: 3372.01 ms (status 200)
- GET /api/clients: 3072.41 ms (status 200)
- POST /api/documents: 2957.78 ms (status 200)
- GET /api/clients: 2510.04 ms (status 200)
- POST /api/authContext/login: 2152.65 ms (status 401)
- POST /api/authContext/login: 2148.14 ms (status 401)
- POST /api/admin_payments: 2117.34 ms (status 400)
- POST /api/admin_payments: 2116.36 ms (status 400)

## Conclusion

- Le dispositif couvre generation massive de donnees, tentatives de brute force, acces non autorises, charge lecture/ecriture, stress et hooks chaos optionnels.
- Pour un test a tres haute intensite (1000 a 10000 sessions actives), augmente les parametres du runner et execute la suite sur une machine dediee.
