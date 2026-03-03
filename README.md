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
