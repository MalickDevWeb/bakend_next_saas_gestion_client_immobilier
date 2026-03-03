# Guide Complet des Seeders

Ce guide explique la couche seeders ajoutee au projet.

## 1. Pourquoi utiliser des seeders

Un seeder sert a injecter des donnees de depart dans la base.
Exemple: configuration systeme de base.

Avantages:
- environnement reproductible
- demarrage rapide en local
- pas de creation manuelle repetitive

## 2. Arborescence des seeders

```text
prisma/
  seed.mjs
  seeders/
    SeederAbstrait.mjs
    donneesConfigurationSysteme.mjs
    SeederConfigurationSysteme.mjs
    OrchestrateurSeeders.mjs
```

## 3. Role de chaque fichier

- `prisma/seed.mjs`
  - point d entree d execution
  - cree `PrismaClient`
  - lance `OrchestrateurSeeders`

- `prisma/seeders/SeederAbstrait.mjs`
  - classe parent commune
  - impose `executer()`

- `prisma/seeders/donneesConfigurationSysteme.mjs`
  - jeu de donnees source du seeding configuration

- `prisma/seeders/SeederConfigurationSysteme.mjs`
  - upsert de la table `configuration_systeme`

- `prisma/seeders/OrchestrateurSeeders.mjs`
  - execute tous les seeders dans l'ordre

## 4. Commandes

1. Generer le client prisma:

```bash
npm run prisma:generate
```

2. Pousser le schema:

```bash
npm run prisma:push
```

3. Lancer les seeders:

```bash
npm run prisma:seed
```

## 5. Ajouter un nouveau seeder

1. Creer `prisma/seeders/SeederXxx.mjs`
2. Etendre `SeederAbstrait`
3. Implementer `executer()`
4. Declarer le seeder dans `OrchestrateurSeeders.mjs`
5. Documenter le changement (obligatoire)

## 6. Bonnes pratiques

- preferer `upsert` pour idempotence
- logguer le nombre de lignes traitees
- garder un seeder par responsabilite
- separer les donnees statiques dans un fichier dedie
- ne pas ecraser les valeurs `CUSTOM` ou `verrouille=true`

## 6.1 Structure des donnees seedees (nouveau modele type)

Chaque element seed est de la forme:

```js
{
  cle: 'application.nom',
  valeurTexte: 'Backend KYA', // string
  valeurNombre: null, // number si type NUMBER
  valeurBooleen: null, // boolean si type BOOLEAN
  typeValeur: 'STRING', // STRING | NUMBER | BOOLEAN
  portee: 'GLOBAL', // GLOBAL | ADMIN
  adminId: null, // renseigne si portee ADMIN
  scopeCle: 'GLOBAL', // GLOBAL ou identifiant admin
  origine: 'DEFAULT', // DEFAULT | CUSTOM
  verrouille: false,
}
```

## 7. Lien avec la charte doc

Tout changement des seeders doit mettre a jour:
- `docs/REFERENCE_FICHIER_PAR_FICHIER.md`
- `docs/CAPTURES_DOSSIERS_ET_SOUS_DOSSIERS.md` (si arborescence change)
- `docs/INDEX_DOCUMENTATION_COMPLETE.md`
- `app/docs/_lib/documentation.ts`
