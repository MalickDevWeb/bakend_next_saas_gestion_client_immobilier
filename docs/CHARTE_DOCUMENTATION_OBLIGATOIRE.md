# Charte Documentation Obligatoire

Cette charte est une regle projet:

## Regle 0 - Prompt maitre obligatoire pour chaque demande

Chaque nouvelle demande de fonctionnalite doit utiliser:
- `docs/PROMPT_MAITRE_IMPLEMENTATION_FONCTIONNALITE.md`

Interdiction de contourner ce cadre. Toute implementation doit suivre ses etapes A -> Z.

## Regle 1 - Toute modification de code doit avoir sa documentation

A chaque changement de code, il faut documenter:
- ce qui a ete modifie
- pourquoi
- ou (fichiers impactes)
- comment utiliser le changement
- impacts (routes, architecture, schema, messages, middlewares)

## Regle 2 - Mise a jour minimale obligatoire

Selon le type de changement, mettre a jour au minimum:

1. Changement architecture / dossier:
- `docs/GUIDE_DOSSIER_PAR_DOSSIER.md`
- `docs/CAPTURES_DOSSIERS_ET_SOUS_DOSSIERS.md`

2. Ajout/suppression/renommage de fichier:
- `docs/REFERENCE_FICHIER_PAR_FICHIER.md`

3. Changement de concept technique (POO, SOLID, DTO, DAO, middleware, exceptions):
- `docs/CONCEPTS_BACKEND_POO_SOLID.md`

4. Changement fonctionnel global:
- `docs/GUIDE_MAITRE_ARCHITECTURE_REUTILISABLE.md`

5. Changement visible API:
- Swagger (`app/api/*/route.ts` annotations)
- page docs si necessaire (`/documentation`, `/docs`)

## Regle 3 - Documentation web synchronisee

Si un nouveau document est ajoute dans `docs/`, il doit etre reference dans:
- `docs/INDEX_DOCUMENTATION_COMPLETE.md`
- `app/docs/_lib/documentation.ts`

Ainsi il est visible sur le site web `/docs`.

## Regle 4 - Definition of Done

Un travail n'est considere termine que si:
- code implemente
- docs associees mises a jour
- `npm run lint` passe
- `npx tsc --noEmit` passe
- tests de la fonctionnalite executes et valides (minimum: tests manuels documentes + checks qualite)

## Regle 5 - Tests obligatoires par fonctionnalite

Avant de passer a la fonctionnalite suivante, il faut:

1. definir le plan de test de la fonctionnalite (cas nominal + cas erreur + securite/permissions);
2. executer les checks qualite (`npm run test:qualite`);
3. executer le score qualite (`npm run qualite:score`) avec seuil >= 80%;
   - portee par defaut: code modifie (delta de la fonctionnalite)
   - audit global possible: `QUALITE_PORTEE=projet npm run qualite:score`
4. executer les tests API/flux (Swagger/curl/Postman) et noter les resultats;
5. consigner les preuves de test dans la doc du module.

Reference test obligatoire:
- `docs/PROTOCOLE_TESTS_PAR_FONCTIONNALITE.md`

Regle de blocage:
- si score qualite < 80%, on corrige et on relance jusqu a atteindre >= 80%.

## Regle 6 - Format d'une bonne note de documentation

Chaque note doit repondre a ces 5 questions:
- Quoi ?
- Pourquoi ?
- Ou ?
- Comment ?
- Verification ?

## Checklist rapide avant fin de tache

- [ ] Les fichiers modifies sont expliques
- [ ] Les nouveaux fichiers sont references
- [ ] Les captures/arborescences sont a jour si structure changee
- [ ] Le portail web `/docs` affiche le nouveau document
- [ ] Lint + Typecheck sont verts
- [ ] Tests fonctionnalite executes et traces dans la doc
- [ ] Score qualite >= 80%
