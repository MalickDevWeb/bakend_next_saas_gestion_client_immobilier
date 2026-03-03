# Charte Documentation Obligatoire

Cette charte est une regle projet:

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

## Regle 5 - Format d'une bonne note de documentation

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

