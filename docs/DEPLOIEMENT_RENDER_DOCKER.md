# Deploiement sur Render (Docker + Neon PostgreSQL)

Ce guide explique le deploiement de `next-backend` sur Render avec Docker.

## 1. Fichiers utilises

- `Dockerfile`
- `.dockerignore`
- `render.yaml`
- `scripts/demarrer-render.sh`

## 2. Strategie de deploiement

- Build image Docker (multi-stage)
- Demarrage conteneur sur Render
- Application schema Prisma au boot (`prisma db push`)
- Lancement Next.js en mode production sur le port Render

## 3. Variables d'environnement Render

A configurer dans Render:

- `DATABASE_URL` (obligatoire): URL Neon PostgreSQL
- `NODE_ENV=production`
- `MAINTENANCE_ACTIVE=false`
- `APPLIQUER_PRISMA_PUSH=true` (ou `false` si tu veux gerer schema manuellement)

## 4. Commandes locales de verification

Avant push:

```bash
npm run lint
npx tsc --noEmit
npm run prisma:generate
```

## 5. Deploiement via Blueprint (render.yaml)

1. Pousser le repo sur GitHub
2. Dans Render: **New +** -> **Blueprint**
3. Connecter le repo
4. Render lit `render.yaml`
5. Ajouter `DATABASE_URL` dans les variables
6. Deployer

Health check:
- `/api/sante`

## 6. Deploiement manuel (sans blueprint)

1. **New +** -> **Web Service**
2. Selectionner repo
3. Runtime: **Docker**
4. Dockerfile Path: `./Dockerfile`
5. Ajouter variables env (cf section 3)
6. Deploy

## 7. Details Docker

Le `Dockerfile`:
- installe dependances
- genere Prisma Client
- build Next.js
- prune dev dependencies
- demarre via `scripts/demarrer-render.sh`

Le script de demarrage:
- applique `prisma db push` (optionnel via variable)
- demarre `next start -H 0.0.0.0 -p $PORT`

## 8. Liens de verification apres deploiement

- `GET /api/sante`
- `GET /api/documentation`
- `GET /` (redirige vers `/docs`)
- `GET /swagger` (alias Swagger UI)
- `GET /documentation`
- `GET /docs`

## 9. Notes importantes

- La base est Neon PostgreSQL (pas json-server)
- Aucune colonne JSON n'est utilisee pour `ConfigurationSysteme`
- Pour production stricte, prefere migrations (`prisma migrate deploy`) au lieu de `db push`
