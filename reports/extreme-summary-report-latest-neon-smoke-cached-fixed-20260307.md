# Rapport Extreme Performance / Securite / Scalabilite

- Tag scenario: `neon-smoke-cached-fixed-20260307`
- Genere le: 2026-03-07T21:08:03.740Z

## Seed

- Debut: 2026-03-07T21:06:41.484Z
- Fin: 2026-03-07T21:07:02.927Z
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
- transactionsPaiement: 24
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
- suspended: 1
- pending_validation: 1
- blocked: 1

### Distribution paiements mensuels
- paid: 9
- partial: 5
- cancelled: 3
- refunded: 3
- late: 2
- processing: 2

## Charge et securite

- Base URL: http://localhost:3100
- Duree suite: 56608 ms
- Total requetes: 253
- Succes: 253
- Erreurs: 0

### Scenarios
- read_mix: req=30, ok=30, ko=0, p95=3860.76 ms, max=5410.13 ms
- document_write_mix: req=6, ok=6, ko=0, p95=4631.69 ms, max=4631.69 ms
- protected_route_without_auth: req=12, ok=12, ko=0, p95=214.45 ms, max=214.45 ms
- bad_csrf_write: req=12, ok=12, ko=0, p95=146.24 ms, max=146.24 ms
- tampered_payment: req=12, ok=12, ko=0, p95=3605.38 ms, max=3605.38 ms
- brute_force_login: req=12, ok=12, ko=0, p95=3626.91 ms, max=3626.91 ms
- logout_token_reuse: req=4, ok=4, ko=0, p95=3271.82 ms, max=3271.82 ms
- super_admin_without_second_auth: req=1, ok=1, ko=0, p95=3866.97 ms, max=3866.97 ms
- stress_mix: req=40, ok=40, ko=0, p95=2484.08 ms, max=2524.31 ms

### Chaos
- server_stop_restart: ignore (Chaos hook non configure)
- database_break_restore: ignore (Chaos hook non configure)

### Requetes les plus lentes
- GET /api/clients: 5410.13 ms (status 200)
- POST /api/documents: 4631.69 ms (status 200)
- POST /api/documents: 4430.9 ms (status 200)
- GET /api/payment-providers/config: 3866.97 ms (status 403)
- GET /api/admin_payments/status: 3860.76 ms (status 200)
- POST /api/authContext/login: 3626.91 ms (status 401)
- POST /api/admin_payments: 3605.38 ms (status 400)
- POST /api/authContext/login: 3586.12 ms (status 401)
- POST /api/authContext/login: 3535.85 ms (status 401)
- POST /api/authContext/login: 3516.76 ms (status 401)

## Conclusion

- Le dispositif couvre generation massive de donnees, tentatives de brute force, acces non autorises, charge lecture/ecriture, stress et hooks chaos optionnels.
- Pour un test a tres haute intensite (1000 a 10000 sessions actives), augmente les parametres du runner et execute la suite sur une machine dediee.
