# Rapport Extreme Performance / Securite / Scalabilite

- Tag scenario: `neon-full-5x2000-20260307-213646`
- Genere le: 2026-03-07T22:48:37.863Z

## Seed

- Debut: 2026-03-07T21:37:02.547Z
- Fin: 2026-03-07T21:46:55.909Z
- Admins simules: 5
- Clients par admin: 2000
- Total clients cibles: 10000

## Base de donnees

- utilisateurs: 10006
- admins: 0
- entreprises: 5
- clients: 9904
- locations: 9904
- documents: 29862
- paiementsMensuels: 39616
- transactionsPaiement: 34096
- depots: 9904
- notifications: 10010
- journauxAuditUtilisateur: 80000
- journauxAuditAdmin: 94982
- blockedIps: 52
- sessions: 20000
- refreshTokens: 20000
- tentativesConnexionEchouees: 10000
- tentativesConnexionReussies: 30000
- paiementsAbonnementAdmin: 0
- statutsAbonnementAdmin: 0

### Distribution statuts clients
- active: 5712
- pending_validation: 1565
- suspended: 1434
- blocked: 1193

### Distribution paiements mensuels
- paid: 14221
- unpaid: 5520
- late: 4810
- partial: 4678
- processing: 3995
- refunded: 3225
- cancelled: 3167

## Charge et securite

- Base URL: http://127.0.0.1:3100
- Duree suite: 1508434 ms
- Total requetes: 13745
- Succes: 4044
- Erreurs: 9701

### Scenarios
- read_mix: req=2400, ok=1670, ko=730, p95=93557.87 ms, max=272879.04 ms
- document_write_mix: req=480, ok=0, ko=480, p95=8945.26 ms, max=14277.32 ms
- protected_route_without_auth: req=50, ok=50, ko=0, p95=201.75 ms, max=264.08 ms
- bad_csrf_write: req=50, ok=50, ko=0, p95=183.73 ms, max=198.19 ms
- tampered_payment: req=40, ok=0, ko=40, p95=2910.99 ms, max=3573.62 ms
- brute_force_login: req=250, ok=250, ko=0, p95=5579.89 ms, max=5767.48 ms
- logout_token_reuse: req=4, ok=4, ko=0, p95=2831.52 ms, max=2831.52 ms
- super_admin_without_second_auth: req=1, ok=0, ko=1, p95=344.84 ms, max=344.84 ms
- stress_mix: req=3600, ok=0, ko=3600, p95=18358.44 ms, max=299065.84 ms

### Chaos
- server_stop_restart: ignore (Chaos hook non configure)
- database_break_restore: ignore (Chaos hook non configure)

### Requetes les plus lentes
- GET /api/admin_payments/status: 299065.84 ms (status 500)
- GET /api/documents: 296830.4 ms (status 500)
- GET /api/clients: 294512.93 ms (status 500)
- GET /api/authContext: 292270.4 ms (status 500)
- GET /api/notifications: 290411.12 ms (status 500)
- GET /api/admin_payments/status: 287842.75 ms (status 500)
- GET /api/documents: 285412.01 ms (status 500)
- GET /api/clients: 283160.89 ms (status 500)
- GET /api/authContext: 281181.02 ms (status 500)
- GET /api/notifications: 278993.55 ms (status 500)

## Conclusion

- Le dispositif couvre generation massive de donnees, tentatives de brute force, acces non autorises, charge lecture/ecriture, stress et hooks chaos optionnels.
- Pour un test a tres haute intensite (1000 a 10000 sessions actives), augmente les parametres du runner et execute la suite sur une machine dediee.
