# Rapport Extreme Performance / Securite / Scalabilite

- Tag scenario: `neon-smoke-20260307204557`
- Genere le: 2026-03-07T20:47:05.602Z

## Seed

- Debut: 2026-03-07T20:45:58.116Z
- Fin: 2026-03-07T20:46:19.367Z
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
- transactionsPaiement: 22
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
- active: 7
- suspended: 3
- blocked: 1
- pending_validation: 1

### Distribution paiements mensuels
- paid: 11
- partial: 3
- processing: 3
- unpaid: 2
- cancelled: 2
- refunded: 2
- late: 1

## Charge et securite

- Base URL: http://localhost:3100
- Duree suite: 42218 ms
- Total requetes: 253
- Succes: 229
- Erreurs: 24

### Scenarios
- read_mix: req=30, ok=26, ko=4, p95=2598.06 ms, max=3462.05 ms
- document_write_mix: req=6, ok=6, ko=0, p95=3084.67 ms, max=3084.67 ms
- protected_route_without_auth: req=12, ok=12, ko=0, p95=399.82 ms, max=399.82 ms
- bad_csrf_write: req=12, ok=12, ko=0, p95=255.27 ms, max=255.27 ms
- tampered_payment: req=12, ok=12, ko=0, p95=2437.73 ms, max=2437.73 ms
- brute_force_login: req=12, ok=12, ko=0, p95=1779.27 ms, max=1779.27 ms
- logout_token_reuse: req=4, ok=4, ko=0, p95=1937.88 ms, max=1937.88 ms
- super_admin_without_second_auth: req=1, ok=1, ko=0, p95=1933.29 ms, max=1933.29 ms
- stress_mix: req=40, ok=32, ko=8, p95=2826.82 ms, max=3265.94 ms

### Chaos
- server_stop_restart: ignore (Chaos hook non configure)
- database_break_restore: ignore (Chaos hook non configure)

### Requetes les plus lentes
- GET /api/clients: 3462.05 ms (status 500)
- GET /api/clients: 3265.94 ms (status 500)
- POST /api/documents: 3084.67 ms (status 200)
- GET /api/clients: 2974.9 ms (status 500)
- POST /api/documents: 2929.05 ms (status 200)
- GET /api/clients: 2826.82 ms (status 500)
- GET /api/clients: 2640.7 ms (status 500)
- GET /api/clients: 2598.06 ms (status 500)
- GET /api/clients: 2510.89 ms (status 500)
- POST /api/admin_payments: 2437.73 ms (status 400)

## Conclusion

- Le dispositif couvre generation massive de donnees, tentatives de brute force, acces non autorises, charge lecture/ecriture, stress et hooks chaos optionnels.
- Pour un test a tres haute intensite (1000 a 10000 sessions actives), augmente les parametres du runner et execute la suite sur une machine dediee.
