# Next Backend KYA

Backend API base sur Next.js (App Router), avec architecture POO/SOLID, Prisma, Zod et Swagger.

## Lancer le projet

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

## Documentation complete

- Portail web de documentation:
  - `/docs`
- Charte obligatoire (a respecter pour chaque changement):
  - [`docs/CHARTE_DOCUMENTATION_OBLIGATOIRE.md`](docs/CHARTE_DOCUMENTATION_OBLIGATOIRE.md)
- Index global (lecture recommandee):
  - [`docs/INDEX_DOCUMENTATION_COMPLETE.md`](docs/INDEX_DOCUMENTATION_COMPLETE.md)
- Guide maitre (architecture reutilisable, etapes de reproduction):
  - [`docs/GUIDE_MAITRE_ARCHITECTURE_REUTILISABLE.md`](docs/GUIDE_MAITRE_ARCHITECTURE_REUTILISABLE.md)
- Guide dossier par dossier / sous-dossier:
  - [`docs/GUIDE_DOSSIER_PAR_DOSSIER.md`](docs/GUIDE_DOSSIER_PAR_DOSSIER.md)
- Guide seeders:
  - [`docs/SEEDERS_GUIDE_COMPLET.md`](docs/SEEDERS_GUIDE_COMPLET.md)
- Modele de table configuration:
  - [`docs/MODELE_CONFIGURATION_SYSTEME.md`](docs/MODELE_CONFIGURATION_SYSTEME.md)
- Guide deploiement Render:
  - [`docs/DEPLOIEMENT_RENDER_DOCKER.md`](docs/DEPLOIEMENT_RENDER_DOCKER.md)
- Captures textuelles (arborescences + schemas de flux):
  - [`docs/CAPTURES_DOSSIERS_ET_SOUS_DOSSIERS.md`](docs/CAPTURES_DOSSIERS_ET_SOUS_DOSSIERS.md)
- Reference exhaustive fichier par fichier:
  - [`docs/REFERENCE_FICHIER_PAR_FICHIER.md`](docs/REFERENCE_FICHIER_PAR_FICHIER.md)
- Documentation exhaustive fichier par fichier:
  - [`docs/DOCUMENTATION_FICHIER_PAR_FICHIER.md`](docs/DOCUMENTATION_FICHIER_PAR_FICHIER.md)
- Documentation des concepts (POO/SOLID, couches, DTO, DAO, exceptions, builders, objets valeur):
  - [`docs/CONCEPTS_BACKEND_POO_SOLID.md`](docs/CONCEPTS_BACKEND_POO_SOLID.md)

## Endpoints disponibles

- `GET /api/sante`
- `GET /api/documentation`
- `GET /documentation`
- `GET /docs` (site web documentation)
- `GET /api/securite/super-admin/rapport-hebdo` (rapport global + webhook super admin)
- `GET /api/notifications/clients/impayes` (relances clients impayes + resume admin)
- `GET /api/audit_logs/auto-export` (genere le snapshot auto-export backend)
- `GET /api/audit_logs/auto-export/status` (etat du dernier auto-export)
- `GET /api/audit_logs/auto-export/latest` (telecharge le dernier snapshot auto-export)

## Variables d environnement utiles (alertes super admin)

- `ALERTE_SUPER_ADMIN_WEBHOOK_URL` (fallback sur `ALERTE_SECURITE_WEBHOOK_URL`)
- `SUPER_ADMIN_SANTE_ALERT_COOLDOWN_MS` (anti-spam alertes sante, defaut 900000)
- `SUPER_ADMIN_REPORT_CRON_SECRET` (header `x-cron-secret` pour cron)
- `AUDIT_AUTO_EXPORT_CRON_SECRET` (secret dedie auto-export audit, fallback sur `SUPER_ADMIN_REPORT_CRON_SECRET`)

## Cron auto-export audit backend

Declenchement direct:

```bash
bash scripts/trigger-audit-auto-export.sh https://votre-domaine.tld
```

Commande cron exemple:

```bash
0 * * * * /bin/bash /app/scripts/trigger-audit-auto-export.sh https://votre-domaine.tld >> /tmp/kya-audit-auto-export.log 2>&1
```

Equivalent curl:

```bash
curl -H "x-cron-secret: $AUDIT_AUTO_EXPORT_CRON_SECRET" https://votre-domaine.tld/api/audit_logs/auto-export
```

## Variables d environnement utiles (notifications Brevo)

- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`
- `BREVO_NOTIFICATION_CLIENT_EMAILS` (liste: `email1,email2`)
- `BREVO_NOTIFICATION_ADMIN_EMAILS` (liste: `email1,email2`)
- `BREVO_NOTIFICATION_SUPER_ADMIN_EMAILS` (liste: `email1,email2`, fallback `SEED_SUPER_ADMIN_EMAIL`)
