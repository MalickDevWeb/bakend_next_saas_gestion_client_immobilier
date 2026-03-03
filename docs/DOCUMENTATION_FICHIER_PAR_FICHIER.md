# Documentation Complete Fichier Par Fichier

Ce document explique chaque fichier du projet `next-backend`, son role et comment l'utiliser.

## 1) Fichiers racine

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `.env` | Variables d'environnement locales | Definir `DATABASE_URL` pour Prisma. Ne pas commit les secrets. |
| `.gitignore` | Regles d'exclusion Git | Laisser tel quel pour ignorer `node_modules`, `.env*`, `.next`, etc. |
| `README.md` | Point d'entree du projet | Lire les commandes principales (`dev`, `build`, etc.). |
| `eslint.config.mjs` | Configuration lint | Modifie si tu veux renforcer/assouplir les regles ESLint. |
| `next-env.d.ts` | Typages Next auto-generes | Ne pas modifier manuellement. |
| `next.config.ts` | Configuration Next.js | Ajouter ici les options Next (rewrites, headers, images...). |
| `package.json` | Scripts + dependances | Utiliser `npm run dev`, `npm run prisma:generate`, `npm run lint`, etc. |
| `package-lock.json` | Verrouillage versions npm | Auto-genere par npm. Ne pas editer a la main. |
| `tsconfig.json` | Configuration TypeScript | Gerer alias `@/*`, strict mode, resolution module. |
| `prisma/schema.prisma` | Schema BD Prisma | Definir tables/modeles, puis `npm run prisma:generate` et `npm run prisma:push`. |

## 2) Couche HTTP Next (app/)

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `app/layout.tsx` | Layout minimal App Router | Garde ce fichier meme en backend API-only (obligatoire Next App Router). |
| `app/api/sante/route.ts` | Endpoint `GET /api/sante` | Route principale de health-check. Passe par le controleur + gestion d'erreurs `ErreurHttp`. |
| `app/api/documentation/route.ts` | Endpoint `GET /api/documentation` | Retourne la spec OpenAPI generee par `GenerateurSwagger`. |
| `app/documentation/page.tsx` | UI Swagger | Ouvrir `/documentation` pour visualiser et tester l'API. |

## 3) Coeur (src/coeur)

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `src/coeur/configuration/ConfigurationApplication.ts` | Configuration applicative | Lire `APP_NAME` et `NODE_ENV` via methodes statiques. |
| `src/coeur/conteneur/ConteneurDependances.ts` | Injection de dependances | Point unique d'assemblage: adaptateurs infrastructure -> services -> controleurs. |
| `src/coeur/erreurs/ErreurHttp.ts` | Erreur metier HTTP | Lever `new ErreurHttp(code, message, details)` pour renvoyer des reponses API propres. |
| `src/coeur/interfaces/InterfaceClientBaseDeDonnees.ts` | Contrat acces BD | Toute implementation BD doit exposer `verifierConnexion()`. |
| `src/coeur/interfaces/InterfaceValidateurEntree.ts` | Contrat validation input | Toute implementation de validation entree doit exposer `parserRequeteSante()`. |

## 4) Controleur + Service actifs

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `src/controleurs/ControleurSante.ts` | Controleur API Sante | Recoit l'entree brute, valide via interface, delegue au service. |
| `src/application/services/ServiceSante.ts` | Logique metier Sante | Construit le payload de sante, teste BD via interface et applique mode verbeux. |

### Flux d'execution actuel

1. `GET /api/sante` appelle `conteneurDependances.controleurSante.traiterRequete(...)`.
2. `ControleurSante` utilise `ValidateurZod` (via interface) pour parser les params.
3. `ServiceSante` utilise `AdaptateurPrisma` (via interface) pour verifier la BD.
4. La route renvoie JSON ou erreur standardisee.

## 5) Infrastructure active

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `src/infrastructure/base_de_donnees/ClientPrisma.ts` | Singleton PrismaClient | Utiliser `ClientPrisma.obtenirInstance()` pour reutiliser la connexion. |
| `src/infrastructure/base_de_donnees/AdaptateurPrisma.ts` | Adaptateur BD concret | Implementation de `InterfaceClientBaseDeDonnees` pour health-check SQL (`SELECT 1`). |
| `src/infrastructure/validateurs/ValidateurZod.ts` | Validation concrete Zod | Implementation de `InterfaceValidateurEntree`. Convertit `verbeux` et leve `ErreurHttp` si invalide. |
| `src/infrastructure/utils/UtilitaireDate.ts` | Helper date | Utiliser `UtilitaireDate.maintenant()` pour centraliser l'horodatage. |
| `src/infrastructure/utils/UtilitaireIdentifiant.ts` | Helper identifiant | Utiliser `UtilitaireIdentifiant.generer()` pour UUID. |

## 6) Documentation technique interne

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `src/documentation/GenerateurSwagger.ts` | Generation OpenAPI | Ajoute/maintient les annotations Swagger dans `app/api/**/route.ts`, ce generateur les agrège. |
| `src/docs/README.ts` | Placeholder docs code | Fichier reserve. A remplacer plus tard par docs techniques TS si besoin. |
| `src/tests/README.ts` | Placeholder tests | Fichier reserve. A remplacer par tests unitaires/integration. |

## 7) Messages centralises (src/messages)

Regle projet: **toujours importer depuis `@/src/messages`**, pas depuis des sous-fichiers profonds.

Exemple:

```ts
import { ERRORS, STATUS, t } from '@/src/messages'
```

### 7.1 Point d'entree et agregateurs

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `src/messages/index.ts` | Facade centrale messages | Import unique pour tout le backend (`t`, constantes, groupes). |
| `src/messages/app.ts` | Aggregation globale app | Fusionne toutes les cles/messages FR/EN et expose `t(...)`. |
| `src/messages/validation.ts` | Aggregation validation FR/EN | Expose `tValidation(...)` et les packs validation par langue. |
| `src/messages/validation-keys.ts` | Cles validation partagees | Ajouter ici les nouvelles cles validation transverses. |

### 7.2 Sous-modules `src/messages/app/*`

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `src/messages/app/index.ts` | Re-export app messages | Point d'export interne des modules app. |
| `src/messages/app/actions.ts` | Cles/actions UI/API | Ajouter les nouvelles actions metier et leurs traductions FR/EN. |
| `src/messages/app/confirmations.ts` | Cles confirmations | Messages de confirmation (oui/non, validation operation). |
| `src/messages/app/entities.ts` | Cles entites | Libelles metier d'entites (service, base de donnees, etc.). |
| `src/messages/app/errors.ts` | Cles erreurs | Messages erreurs techniques/metier FR/EN. |
| `src/messages/app/labels.ts` | Cles labels generiques | Labels transverses (`API`, `VERSION`, ...). |
| `src/messages/app/menu.ts` | Cles navigation menu | Libelles menu/navigation. |
| `src/messages/app/nav.ts` | Cles navigation courte | Libelles type retour/back. |
| `src/messages/app/pages.ts` | Cles pages | Libelles de pages. |
| `src/messages/app/status.ts` | Cles statuts | Statuts metier (`ok`, `degrade`, `disponible`, `indisponible`). |
| `src/messages/app/success.ts` | Cles succes | Messages de succes standards. |
| `src/messages/app/validation.ts` | Cles validation app | Cles validation applicative generales. |

### 7.3 Packs FR validation

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `src/messages/franchais/validation.common.ts` | Validation FR commune | Ajouter les messages FR communs. |
| `src/messages/franchais/validation.auth.ts` | Validation FR auth | Ajouter validations FR auth. |
| `src/messages/franchais/validation.client.ts` | Validation FR client | Ajouter validations FR client. |
| `src/messages/franchais/validation.property.ts` | Validation FR bien/location | Ajouter validations FR property/location. |
| `src/messages/franchais/validation.payment.ts` | Validation FR paiement | Ajouter validations FR paiement. |
| `src/messages/franchais/validation.ts` | Aggregateur FR validation | Fusionne tous les modules FR validation. |

### 7.4 Packs EN validation

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `src/messages/anglais/validation.common.ts` | Validation EN commune | Ajouter les messages EN communs. |
| `src/messages/anglais/validation.auth.ts` | Validation EN auth | Ajouter validations EN auth. |
| `src/messages/anglais/validation.client.ts` | Validation EN client | Ajouter validations EN client. |
| `src/messages/anglais/validation.property.ts` | Validation EN bien/location | Ajouter validations EN property/location. |
| `src/messages/anglais/validation.payment.ts` | Validation EN paiement | Ajouter validations EN paiement. |
| `src/messages/anglais/validation.ts` | Aggregateur EN validation | Fusionne tous les modules EN validation. |

## 8) Domaine (preparation - placeholders)

Ces fichiers existent pour respecter l'architecture cible (POO/SOLID) mais ne sont pas encore branches dans des routes de production.

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `src/domaine/entites/EntiteUtilisateur.ts` | Entite metier utilisateur | Ajouter attributs + invariants metier utilisateur. |
| `src/domaine/enumerations/EnumerationRoleUtilisateur.ts` | Enum roles | Reutiliser pour typer les roles et eviter les strings libres. |
| `src/domaine/interfaces/InterfaceReferentielUtilisateur.ts` | Contrat repository utilisateur | Implementer dans infrastructure (Prisma, memoire, test). |
| `src/domaine/objets_valeur/ObjetValeurEmail.ts` | Value object email | Ajouter validations format/normalisation email. |

## 9) Application (preparation - placeholders)

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `src/application/dtos/DtoCreationUtilisateur.ts` | DTO creation utilisateur | Utiliser pour payload d'entree creation user. |
| `src/application/dtos/DtoReponseUtilisateur.ts` | DTO reponse utilisateur | Utiliser pour sortie API sans exposer entite brute. |
| `src/application/fabriques/FabriqueUtilisateur.ts` | Fabrique user | Creer une `EntiteUtilisateur` valide a partir d'entrees metier. |
| `src/application/mappers/MappeurUtilisateur.ts` | Mapper entite -> DTO | Convertir l'entite en DTO de sortie. |
| `src/application/validateurs/ValidateurUtilisateur.ts` | Validateur user | Ajouter regles de validation use case utilisateur. |

## 10) Infrastructure (preparation - placeholders)

| Fichier | Role | Comment l'utiliser |
|---|---|---|
| `src/infrastructure/faker/FakerUtilisateur.ts` | Donnees fake user | Generer donnees de tests/seed pour user. |
| `src/infrastructure/referentiels/ReferentielUtilisateurMemoire.ts` | Repository in-memory | Mock rapide pour tests sans BD reelle. |

## 11) Comment ajouter une nouvelle fonctionnalite (mode standard)

1. Ajouter la route HTTP dans `app/api/.../route.ts`.
2. Ajouter/etendre un controleur `src/controleurs/...`.
3. Ajouter/etendre un service metier `src/application/services/...`.
4. Exposer les interfaces necessaires dans `src/coeur/interfaces`.
5. Implementer les adaptateurs concrets dans `src/infrastructure/...`.
6. Cablage dans `src/coeur/conteneur/ConteneurDependances.ts`.
7. Ajouter les messages dans `src/messages/app/*.ts` + traductions FR/EN.
8. Ajouter doc Swagger sur la route.

## 12) Commandes de travail

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
npm run lint
npx tsc --noEmit
```

## 13) Endpoints actuels

- `GET /api/sante`
  - Query optionnelle: `?verbeux=true`
- `GET /api/documentation`
- `GET /documentation` (UI Swagger)

