# Guide Dossier par Dossier et Sous-Dossier

Ce guide explique **ou mettre quoi**, **pourquoi**, et **comment reproduire** la meme structure sur n'importe quel futur projet.

## 1. Racine du projet

### `middleware.ts`

Raison d'exister:
- c'est le point middleware global de Next.js
- il passe avant les routes (`/api/*`)

Regle:
- y mettre uniquement l'orchestration des middlewares

### `app/`

Raison d'exister:
- c'est l'adaptateur du framework Next.js
- il expose les routes HTTP

Regle:
- pas de logique metier complexe ici

### `docs/`

Raison d'exister:
- conserver les manuels versionnes
- faciliter onboarding equipe

### `prisma/`

Raison d'exister:
- schema de base de donnees
- source unique de modele relationnel
- scripts de seed (`seed.mjs`) et classes de seeders (`prisma/seeders/*`)

### `src/`

Raison d'exister:
- contient tout le code metier et technique decoupe en couches

## 2. Sous-dossiers `app/`

### `app/api/`

Raison:
- contient les endpoints API

Conventions:
- une route = un sous-dossier
- fichier obligatoire `route.ts`

Exemples:
- `app/api/sante/route.ts`
- `app/api/documentation/route.ts`

### `app/documentation/`

Raison:
- UI swagger accessible via navigateur

## 3. Sous-dossiers `src/`

## 3.1 `src/coeur/` (le socle)

- `configuration/`: lecture config globale (`ConfigurationApplication`)
- `conteneur/`: injection de dependances (`ConteneurDependances`)
- `interfaces/`: contrats techniques transverses
- `exceptions/`: base hiérarchique des exceptions
- `erreurs/`: compatibilite/historique (ex `ErreurHttp`)

Pourquoi c'est important:
- evite de dupliquer la config, les contrats, et la gestion d'erreur

## 3.2 `src/domaine/` (le metier pur)

- `entites/`: objets metier (etat + comportement)
- `objets_valeur/`: validations metier fortes (email, montant, cni, etc.)
- `builders/`: creation valide d'entites
- `types/`: types metier stricts
- `enumerations/`: enums metier
- `interfaces/dao/`: contrats de persistance
- `exceptions/`: erreurs metier typées

Pourquoi c'est important:
- c'est la partie la plus stable et la plus reutilisable du projet

## 3.3 `src/application/` (les cas d'usage)

- `services/`: orchestration des actions metier
- `dtos/`: transport de donnees (entree/sortie)
- `mappers/`: conversion entite <-> dto
- `fabriques/`: creation propre d'entites
- `validateurs/`: regles de validation applicative
- `exceptions/`: erreurs de cas d'usage

Pourquoi c'est important:
- c'est la couche qui connecte metier et monde exterieur

## 3.4 `src/infrastructure/` (le concret)

- `base_de_donnees/`: adaptateurs Prisma
- `dao/memoire/`: implementations DAO en memoire
- `middlewares/`: filtres techniques avant route (log, maintenance, securite)
- `validateurs/`: implementation technique Zod
- `utils/`: outils techniques communs
- `exceptions/`: erreurs techniques infra
- `faker/`, `referentiels/`: espaces de support pour tests/prototypes

Pourquoi c'est important:
- tu peux changer la techno (DB/validateur) sans toucher le domaine

## 3.5 `src/controleurs/`

Raison:
- interface applicative entre route HTTP et service

## 3.6 `src/messages/`

Raison:
- centraliser tous les textes (FR/EN)

Sous-dossiers:
- `app/`: libelles metier generaux
- `franchais/`: messages validation FR
- `anglais/`: messages validation EN

Regle:
- importer via `@/src/messages`

## 3.7 `src/documentation/` et `src/docs/`

Raison:
- outillage et placeholders de documentation interne

## 3.8 `src/tests/`

Raison:
- espace dedie aux tests unitaires/integration

## 4. Plan de reproduction standard (nouveau projet)

## Phase 1 - Squelette

1. creer dossier racine
2. ajouter `app/`, `src/`, `docs/`, `prisma/`
3. ajouter toutes les couches et sous-couches

## Phase 2 - Premier endpoint

1. service de sante
2. controleur de sante
3. route `/api/sante`
4. conteneur de dependances

## Phase 3 - Domaine minimal

1. `ObjetDomaine`
2. 1ere entite
3. 1er builder
4. 1 objet valeur
5. 1 interface DAO + DAO memoire

## Phase 4 - Qualite

1. exceptions par couche
2. messages centralises
3. swagger
4. lint + typecheck

## 5. Regles "si tu hesites"

- question: "ce fichier parle du metier pur?" -> `src/domaine`
- question: "ce fichier parle d'un endpoint HTTP?" -> `app/api`
- question: "ce fichier orchestre un cas d'usage?" -> `src/application/services`
- question: "ce fichier touche prisma/zod/lib externe?" -> `src/infrastructure`
- question: "ce fichier doit s'executer avant toutes les routes API?" -> `middleware.ts` + `src/infrastructure/middlewares`
- question: "ce fichier est un contrat?" -> `src/coeur/interfaces` ou `src/domaine/interfaces`
- question: "ce fichier est un message texte?" -> `src/messages`

## 6. Definition d'architecture reussie

Tu sais que ton architecture est bonne si:
- tu peux remplacer le stockage sans toucher aux entites
- tu peux ajouter une route sans dupliquer les regles metier
- tu peux tester le service sans serveur HTTP
- tu peux retrouver un fichier rapidement grace au nom
