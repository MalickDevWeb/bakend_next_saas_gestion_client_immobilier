# Concepts Backend KYA (Next.js API + POO + SOLID)

Ce document explique tous les concepts architecturaux utilises dans `next-backend`.
Il complete la documentation fichier-par-fichier avec une vue metier/technique.

## 1. Vision du backend

Le projet est un backend API base sur Next.js (App Router), organise en couches avec separation stricte des responsabilites.

Objectifs:
- code lisible et testable
- dependances controlees via interfaces
- regles metier isolees du framework
- conventions de nommage coherentes en francais

## 2. Couches et regle de dependance

Arborescence logique:

```text
app/                    -> Adaptateurs HTTP Next.js (routes API)
middleware.ts           -> Middleware global Next.js (avant routes API)
src/controleurs         -> Controleurs applicatifs
src/application         -> Cas d'usage, DTO, mappers, fabriques, validateurs
src/domaine             -> Coeur metier pur (entites, objets valeur, builders, types)
src/infrastructure      -> Implementations techniques (Prisma, Zod, DAO memoire...)
src/coeur               -> Configuration, interfaces transverses, conteneur DI, exceptions de base
src/messages            -> Messages centralises FR/EN
prisma/seeders          -> Seeders base de donnees (initialisation donnees)
```

Regle:
- Le domaine ne depend pas de Next.js.
- L'application depend du domaine.
- L'infrastructure implemente des interfaces declarees plus haut.
- `app/api/*` depend du conteneur de dependances.

## 3. Concepts POO par couche

### 3.1 Entite

Dossier: `src/domaine/entites`

Une entite represente un objet metier avec identite et comportement.
Exemples:
- `EntiteClient`
- `EntiteLocation`
- `EntitePaiementMensuel`

Regroupement par module (structure active):
- `src/domaine/entites/authentification/*`
- `src/domaine/entites/administration/*`
- `src/domaine/entites/locations/*`
- `src/domaine/entites/systeme/*`
- `src/domaine/entites/utilisateurs/*`

Compatibilite:
- les anciens chemins `src/domaine/entites/EntiteXxx.ts` restent disponibles comme fichiers pont (`export * from ...`) pour eviter de casser le code existant pendant la transition.

### 3.2 ObjetDomaine (equivalent Java: equals/toString)

Fichier: `src/domaine/entites/ObjetDomaine.ts`

Toutes les entites `Entite*` heritent de `ObjetDomaine`.

Methodes fournies:
- `equals(autre)`
- `estEgal(autre)` (alias francais)
- `toString()`
- `toJSON()`

Comportement:
- comparaison par identite (`id`, `adminId`, `clientId`, etc.) si possible
- sinon comparaison stable par contenu

### 3.3 ObjetValeur

Dossier: `src/domaine/objets_valeur`

Un objet valeur:
- encapsule une valeur valide
- centralise validation + normalisation
- evite les `string`/`number` libres partout

Exemples:
- `ObjetValeurEmail`
- `ObjetValeurTelephoneSenegal`
- `ObjetValeurCniSenegal`
- `ObjetValeurMontant`

Regroupement par module:
- `src/domaine/objets_valeur/authentification/*`
- `src/domaine/objets_valeur/administration/*`
- `src/domaine/objets_valeur/locations/*`
- `src/domaine/objets_valeur/commun/*`

### 3.4 Builder d'entite

Dossier: `src/domaine/builders`

Chaque entite a son builder `BuilderEntiteXxx`.

Role:
- construire une entite coherente
- centraliser les preconditions de creation
- eviter des constructeurs appeles avec des valeurs invalides

Base commune:
- `BuilderAbstrait<T>`

Regroupement par module:
- `src/domaine/builders/authentification/*`
- `src/domaine/builders/administration/*`
- `src/domaine/builders/locations/*`
- `src/domaine/builders/systeme/*`
- `src/domaine/builders/utilisateurs/*`

### 3.5 Types et enumerations

Dossiers:
- `src/domaine/types`
- `src/domaine/enumerations`

Role:
- typer strictement les etats metier
- eliminer les magic strings

Regroupement par module:
- `src/domaine/types/authentification/*`
- `src/domaine/types/administration/*`
- `src/domaine/types/locations/*`
- `src/domaine/types/systeme/*`
- `src/domaine/types/utilisateurs/*`

Nettoyage:
- plus de fichiers `Type*.ts` a la racine de `src/domaine/types` (sauf `index.ts`).

## 4. Concepts application

### 4.1 Service

Dossier: `src/application/services`

Un service porte un cas d'usage.
Exemple: `ServiceSante`.

### 4.2 DTO

Dossier: `src/application/dtos`

Le DTO transporte les donnees entre couches.
Il protege l'API de la structure interne des entites.

Convention:
- DTO regroupes par module (`authentification`, `utilisateurs`, `administration`, `locations`, `systeme`).
- un fichier de module peut contenir plusieurs DTO proches.
- plus de DTO racine legacy: tout est reference via `src/application/dtos/<module>/...`.

### 4.3 Mapper

Dossier: `src/application/mappers`

Le mapper convertit:
- Entite -> DTO de sortie
- DTO -> structure metier (si necessaire)

### 4.4 Fabrique

Dossier: `src/application/fabriques`

La fabrique orchestre la creation metier via builder(s).
Exemple: `FabriqueUtilisateur`.

### 4.5 Validateur

Dossier: `src/application/validateurs`

Contrat d'intention applicative pour les entrees metier.
L'implementation concrete peut venir de Zod cote infrastructure.

### 4.6 Exceptions application

Dossier: `src/application/exceptions`

Exemples:
- `ExceptionApplication`
- `ExceptionValidationApplication`
- `ExceptionCasUsage`

## 5. Concepts infrastructure

### 5.1 DAO (Data Access Object)

Dossiers:
- interfaces: `src/domaine/interfaces/dao`
- implementations memoire: `src/infrastructure/dao/memoire`

Role:
- isoler l'acces persistance
- standardiser CRUD minimal par entite

Regroupement par module:
- `src/domaine/interfaces/dao/authentification|administration|locations|systeme|utilisateurs`
- `src/infrastructure/dao/memoire/authentification|administration|locations|systeme|utilisateurs`
- `src/infrastructure/dao/prisma/authentification`

Nettoyage:
- les anciens fichiers DAO a la racine de `dao/` ont ete retires.
- les imports doivent pointer directement vers les chemins modules ou vers les `index.ts` de module.

Pourquoi DAO ici:
- rendre le backend pret a remplacer la source de donnees sans impacter le domaine

### 5.2 Referentiel

Dossier: `src/infrastructure/referentiels`

`ReferentielUtilisateurMemoire` existe comme variante historique/specialisee.
DAO et referentiel peuvent coexister pendant la transition.

### 5.3 Base de donnees (Prisma)

Dossier: `src/infrastructure/base_de_donnees`

- `ClientPrisma`: gestion du client Prisma
- `AdaptateurPrisma`: implementation du contrat `InterfaceClientBaseDeDonnees`

Principe:
- Prisma reste dans l'infrastructure
- les couches hautes consomment des interfaces

### 5.4 Seeders (initialisation des donnees)

Dossier:
- `prisma/seeders`
- point d entree: `prisma/seed.mjs`

Role:
- injecter des donnees de base de maniere reproductible et idempotente

Pattern:
- `SeederAbstrait` (contrat de seeding)
- `SeederXxx` (responsabilite unique)
- `OrchestrateurSeeders` (ordre d'execution)

Schema recommande pour configuration:
- colonnes scalaires: `valeurTexte`, `valeurNombre`, `valeurBooleen`
- `typeValeur` pour typer (`STRING`, `NUMBER`, `BOOLEAN`)
- `portee` (`GLOBAL`, `ADMIN`)
- `origine` + `verrouille` pour proteger les valeurs custom

### 5.5 Validation technique (Zod)

Dossier: `src/infrastructure/validateurs`

- `ValidateurZod` implemente `InterfaceValidateurEntree`

Principe:
- Zod ne doit pas fuir dans le domaine

### 5.6 Exceptions infrastructure

Dossier: `src/infrastructure/exceptions`

Exemples:
- `ExceptionInfrastructure`
- `ExceptionAccesDonnees`
- `ExceptionDependanceExterne`

## 6. Concepts coeur (cross-cutting)

### 6.1 Conteneur de dependances

Fichier: `src/coeur/conteneur/ConteneurDependances.ts`

Role:
- instancier et cabler les classes
- centraliser l'injection de dependances

### 6.2 Interfaces transverses

Dossier: `src/coeur/interfaces`

Exemples:
- `InterfaceClientBaseDeDonnees`
- `InterfaceValidateurEntree`

Role:
- respecter DIP (Dependency Inversion Principle)

### 6.3 Exceptions coeur

Dossier: `src/coeur/exceptions`

Base des exceptions techniques/metier transverses:
- `ExceptionBase`
- `ExceptionHttp`
- `ExceptionTechnique`
- `ExceptionConfiguration`

Compatibilite:
- `src/coeur/erreurs/ErreurHttp.ts` etend `ExceptionHttp` pour garder le code existant.

## 7. Adaptateur HTTP Next.js

Dossier: `app/api/*`

Une route Next.js agit comme adaptateur HTTP:
1. recupere requete
2. appelle controleur
3. mappe erreur -> reponse HTTP

Exemple actif:
- `GET /api/sante` -> `app/api/sante/route.ts`

## 7.1 Middleware global Next.js

Fichiers:
- `middleware.ts`
- `src/infrastructure/middlewares/*`

Role:
- appliquer des regles transverses avant les routes API
- exemple: journalisation, maintenance, controle global

Pattern utilise:
- `InterfaceMiddlewareHttp` (contrat)
- middlewares unitaires (`MiddlewareJournalisation`, `MiddlewareMaintenance`)
- `PipelineMiddlewaresHttp` (chaine d'execution)

## 8. Documentation API (Swagger)

- `src/documentation/GenerateurSwagger.ts`
- `app/api/documentation/route.ts`
- `app/documentation/page.tsx`

Usage:
- `/api/documentation` retourne l'OpenAPI JSON
- `/documentation` affiche Swagger UI

## 9. Messages centralises

Dossier: `src/messages`

Regle stricte:
- importer depuis `@/src/messages` uniquement

But:
- centraliser labels, erreurs, statuts, validations
- supporter FR/EN
- eviter les messages hardcodes dans les services/controleurs

## 10. SOLID applique concretement

### SRP
- Entites: etat + comportement metier
- Builders: creation valide
- DAO: acces donnees
- Services: orchestration cas d'usage

### OCP
- ajout d'un nouveau DAO/adapter sans modifier les services consommant l'interface

### LSP
- implementations (`AdaptateurPrisma`, `ValidateurZod`) substituables a leur interface

### ISP
- interfaces petites et ciblees (`InterfaceClientBaseDeDonnees`, `InterfaceValidateurEntree`)

### DIP
- services dependant d'abstractions, pas d'implementations concretes

## 11. Convention de nommage (regle du projet)

- noms en francais clairs
- 1 classe principale par fichier
- nom du fichier = nom de la classe
- prefixes explicites:
  - `Entite*`
  - `BuilderEntite*`
  - `ObjetValeur*`
  - `Dto*`
  - `InterfaceDao*`
  - `Dao*Memoire`
  - `Exception*`

## 12. Flux standard d'une fonctionnalite

```text
Route Next.js
-> Controleur
-> Validateur
-> Service
-> Fabrique/Builder
-> DAO (interface)
-> DAO concret (memoire/Prisma)
-> Mapper DTO
-> Reponse HTTP
```

## 13. Checklist d'ajout d'une nouvelle entite

1. Creer `EntiteXxx` (heritant de `ObjetDomaine`)
2. Creer `BuilderEntiteXxx`
3. Ajouter `ObjetValeur*` necessaires
4. Creer `DtoXxx`
5. Creer `InterfaceDaoXxx`
6. Creer `DaoXxxMemoire`
7. Ajouter service/controleur/route si expose en API
8. Ajouter messages FR/EN
9. Documenter le endpoint dans Swagger
10. Verifier `npx tsc --noEmit` et `npm run lint`

## 14. Points importants

- DAO n'est pas obligatoire pour tous les cas techniques (ex: health check).
- Le domaine ne doit pas connaitre Next.js ni Prisma.
- Les validations metier critiques doivent vivre dans objets valeur/builders/services, pas uniquement dans la route.
- En mode strict, les entites portent elles-memes les objets valeur (pas seulement les builders).
  - exemple applique: `src/domaine/entites/EntiteAdmin.ts`
