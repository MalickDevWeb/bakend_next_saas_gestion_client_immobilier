# Rapport Extreme Performance / Securite / Scalabilite

- Tag scenario: `neon-smoke-optimized-20260307`
- Genere le: 2026-03-07T20:56:01.436Z

## Seed

- Debut: 2026-03-07T20:54:40.754Z
- Fin: 2026-03-07T20:55:03.967Z
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
- transactionsPaiement: 20
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
- suspended: 2
- blocked: 1
- pending_validation: 1

### Distribution paiements mensuels
- cancelled: 5
- processing: 5
- paid: 4
- unpaid: 4
- partial: 3
- late: 2
- refunded: 1

## Charge et securite

- Base URL: http://localhost:3100
- Duree suite: 53983 ms
- Total requetes: 253
- Succes: 253
- Erreurs: 0

### Scenarios
- read_mix: req=30, ok=30, ko=0, p95=3281.51 ms, max=3582.79 ms
- document_write_mix: req=6, ok=6, ko=0, p95=4811.99 ms, max=4811.99 ms
- protected_route_without_auth: req=12, ok=12, ko=0, p95=294.45 ms, max=294.45 ms
- bad_csrf_write: req=12, ok=12, ko=0, p95=78.68 ms, max=78.68 ms
- tampered_payment: req=12, ok=12, ko=0, p95=3596.7 ms, max=3596.7 ms
- brute_force_login: req=12, ok=12, ko=0, p95=3826.8 ms, max=3826.8 ms
- logout_token_reuse: req=4, ok=4, ko=0, p95=3076.38 ms, max=3076.38 ms
- super_admin_without_second_auth: req=1, ok=1, ko=0, p95=3358.91 ms, max=3358.91 ms
- stress_mix: req=40, ok=40, ko=0, p95=2349.11 ms, max=2587.17 ms

### Chaos
- server_stop_restart: ignore (Chaos hook non configure)
- database_break_restore: ignore (Chaos hook non configure)

### Requetes les plus lentes
- POST /api/documents: 4811.99 ms (status 200)
- POST /api/documents: 4601.25 ms (status 200)
- POST /api/authContext/login: 3826.8 ms (status 401)
- POST /api/admin_payments: 3596.7 ms (status 400)
- GET /api/clients: 3582.79 ms (status 200)
- POST /api/authContext/login: 3396.61 ms (status 401)
- GET /api/payment-providers/config: 3358.91 ms (status 403)
- POST /api/authContext/login: 3321.95 ms (status 401)
- GET /api/admin_payments/status: 3281.51 ms (status 200)
- POST /api/admin_payments: 3245.84 ms (status 400)

## Conclusion

- Le dispositif couvre generation massive de donnees, tentatives de brute force, acces non autorises, charge lecture/ecriture, stress et hooks chaos optionnels.
- Pour un test a tres haute intensite (1000 a 10000 sessions actives), augmente les parametres du runner et execute la suite sur une machine dediee.
