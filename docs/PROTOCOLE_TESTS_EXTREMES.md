# Protocole Tests Extremes

Ce document decrit le dispositif de test massif du vrai backend `next-backend`.

## Objectif

Verifier le comportement du systeme sous :

- forte volumetrie de donnees
- charge API importante
- tentatives de securite
- stress de lecture/ecriture
- chaos hooks optionnels

## Commandes

```bash
npm run test:extreme:seed
npm run test:extreme:load
npm run test:extreme:report
npm run test:extreme:all
```

## Volume par defaut

Le seed par defaut genere :

- 5 admins
- 2000 clients par admin
- 10000 clients minimum
- documents, locations, paiements, depots, notifications
- sessions, refresh tokens, tentatives de connexion
- journaux audit utilisateur + admin/systeme
- IP bloquees et paiements d abonnement admin

## Parametres importants

Exemples :

```bash
npm run test:extreme:seed -- --tag=preprod-mars --batch-size=250
npm run test:extreme:load -- --tag=preprod-mars --active-users=300 --stress-concurrency=500
npm run test:extreme:report -- --tag=preprod-mars
```

Variables d environnement utiles :

- `BASE_URL`
- `EXTREME_TAG`
- `EXTREME_ADMIN_COUNT`
- `EXTREME_CLIENTS_PER_ADMIN`
- `EXTREME_ACTIVE_USERS`
- `EXTREME_READ_REQUESTS`
- `EXTREME_STRESS_REQUESTS`
- `EXTREME_READ_CONCURRENCY`
- `EXTREME_STRESS_CONCURRENCY`
- `EXTREME_ADMIN_PASSWORD`
- `EXTREME_CLIENT_PASSWORD`
- `EXTREME_SUPER_ADMIN_PASSWORD`

## Hooks chaos optionnels

Le runner accepte des commandes shell externes pour provoquer un incident puis verifier la recuperation :

- `EXTREME_CHAOS_STOP_SERVER_CMD`
- `EXTREME_CHAOS_START_SERVER_CMD`
- `EXTREME_CHAOS_BREAK_DB_CMD`
- `EXTREME_CHAOS_RESTORE_DB_CMD`

Exemple :

```bash
export EXTREME_CHAOS_STOP_SERVER_CMD="docker compose stop app"
export EXTREME_CHAOS_START_SERVER_CMD="docker compose start app"
export EXTREME_CHAOS_BREAK_DB_CMD="docker compose stop postgres"
export EXTREME_CHAOS_RESTORE_DB_CMD="docker compose start postgres"
npm run test:extreme:all -- --tag=chaos-local
```

## Rapports produits

Les scripts ecrivent dans `next-backend/reports/` :

- `extreme-seed-manifest-<tag>.json`
- `extreme-last-seed.json`
- `extreme-load-report-<tag>-<timestamp>.json`
- `extreme-load-report-latest-<tag>.json`
- `extreme-summary-report-<tag>-<timestamp>.json`
- `extreme-summary-report-<tag>-<timestamp>.md`
- `extreme-summary-report-latest-<tag>.json`
- `extreme-summary-report-latest-<tag>.md`

## Limites a connaitre

- Les tests de documents simulent les creations backend et les URLs Cloudinary. Ils ne remplacent pas un benchmark reseau Cloudinary reel.
- Le schema actuel ne porte pas nativement certains metadonnees documentaires comme la taille de fichier ou l utilisateur uploadant dans la table `documents`. Le seed les simule via conventions de nommage et journaux d audit.
- Pour monter a 1000 a 10000 sessions actives, utiliser une machine dediee et augmenter explicitement la concurrence du runner.
