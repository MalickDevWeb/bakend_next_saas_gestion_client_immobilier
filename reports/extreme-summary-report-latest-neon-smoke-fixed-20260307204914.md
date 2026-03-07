# Rapport Extreme Performance / Securite / Scalabilite

- Tag scenario: `neon-smoke-fixed-20260307204914`
- Genere le: 2026-03-07T20:50:15.884Z

## Seed

- Debut: 2026-03-07T20:49:15.709Z
- Fin: 2026-03-07T20:49:35.567Z
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
- active: 9
- blocked: 2
- pending_validation: 1

### Distribution paiements mensuels
- late: 6
- paid: 6
- processing: 4
- refunded: 3
- unpaid: 3
- cancelled: 1
- partial: 1

## Charge et securite

- Base URL: http://localhost:3100
- Duree suite: 36312 ms
- Total requetes: 253
- Succes: 253
- Erreurs: 0

### Scenarios
- read_mix: req=30, ok=30, ko=0, p95=2163.93 ms, max=2572.35 ms
- document_write_mix: req=6, ok=6, ko=0, p95=2457.64 ms, max=2457.64 ms
- protected_route_without_auth: req=12, ok=12, ko=0, p95=114.07 ms, max=114.07 ms
- bad_csrf_write: req=12, ok=12, ko=0, p95=58.51 ms, max=58.51 ms
- tampered_payment: req=12, ok=12, ko=0, p95=1491.36 ms, max=1491.36 ms
- brute_force_login: req=12, ok=12, ko=0, p95=1400.47 ms, max=1400.47 ms
- logout_token_reuse: req=4, ok=4, ko=0, p95=1651.74 ms, max=1651.74 ms
- super_admin_without_second_auth: req=1, ok=1, ko=0, p95=1313.96 ms, max=1313.96 ms
- stress_mix: req=40, ok=40, ko=0, p95=2638.77 ms, max=3691.34 ms

### Chaos
- server_stop_restart: ignore (Chaos hook non configure)
- database_break_restore: ignore (Chaos hook non configure)

### Requetes les plus lentes
- GET /api/clients: 3691.34 ms (status 200)
- GET /api/clients: 3496.52 ms (status 200)
- GET /api/clients: 2638.77 ms (status 200)
- GET /api/clients: 2572.35 ms (status 200)
- POST /api/documents: 2457.64 ms (status 200)
- GET /api/clients: 2442.44 ms (status 200)
- POST /api/documents: 2257.72 ms (status 200)
- POST /api/documents: 2166.7 ms (status 200)
- GET /api/clients: 2163.93 ms (status 200)
- GET /api/clients: 2059.69 ms (status 200)

## Conclusion

- Le dispositif couvre generation massive de donnees, tentatives de brute force, acces non autorises, charge lecture/ecriture, stress et hooks chaos optionnels.
- Pour un test a tres haute intensite (1000 a 10000 sessions actives), augmente les parametres du runner et execute la suite sur une machine dediee.
