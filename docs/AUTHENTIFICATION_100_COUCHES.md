# Authentification 100 Couches (POO + SOLID)

Ce document explique le nouveau module authentification conforme a l architecture complete:

- services applicatifs sans acces Prisma direct,
- repository metier entre services et DAO,
- DAO branchable (Prisma ou memoire),
- entites auth + objets valeur + builders utilises en runtime.

## 1. Flux final

1. Route API (`app/api/authContext/**`)
2. Controleur (`src/controleurs/ControleurAuthContext.ts`)
3. Validateur (`ValidateurAuthentification` + `ValidateurAuthentificationZod`)
4. Services applicatifs auth (`src/application/services/authentification/**`)
5. Repository (`InterfaceRepositoryAuthentification`)
6. DAO (`InterfaceDaoAuthentification`)
7. Persistance (`DaoAuthentificationPrisma` ou `DaoAuthentificationMemoire`)
8. Mapping persistance -> domaine via builders

## 2. Nouvelles briques domaine

### 2.1 Entites

- `EntiteUtilisateurAuthentification`
- `EntitePermissionUtilisateurAuth`
- `EntiteSessionAuthentification`
- `EntiteJetonRefresh`
- `EntiteTentativeConnexion`
- `EntiteAuditSecuriteAuthentification`

### 2.2 Objets valeur

- `ObjetValeurIdentifiantConnexion`
- `ObjetValeurAgentUtilisateur`
- `ObjetValeurJetonAccesJti`
- `ObjetValeurHachageJetonRefresh`

### 2.3 Builders

- `BuilderEntiteUtilisateurAuthentification`
- `BuilderEntitePermissionUtilisateurAuth`
- `BuilderEntiteSessionAuthentification`
- `BuilderEntiteJetonRefresh`
- `BuilderEntiteTentativeConnexion`
- `BuilderEntiteAuditSecuriteAuthentification`

## 3. Repository + DAO

### 3.1 Contrat repository

`src/domaine/interfaces/repository/InterfaceRepositoryAuthentification.ts`

Le repository expose des methodes metier (session, refresh, TOTP, audit, tentatives) et retourne des entites domaine.

### 3.2 Contrat DAO

`src/domaine/interfaces/dao/InterfaceDaoAuthentification.ts`

Le DAO reste technique (format persistance). Le repository convertit vers le domaine.

### 3.3 Implementations

- Prisma:
  - DAO: `src/infrastructure/dao/prisma/DaoAuthentificationPrisma.ts`
  - Repository: `src/infrastructure/repositories/prisma/RepositoryAuthentificationPrisma.ts`
- Memoire:
  - DAO: `src/infrastructure/dao/memoire/DaoAuthentificationMemoire.ts`
  - Repository: `src/infrastructure/repositories/memoire/RepositoryAuthentificationMemoire.ts`
  - Audit: `src/infrastructure/securite/ServiceAuditSecuriteMemoire.ts`

## 4. Services applicatifs auth (mis a jour)

- `ServiceContexteAuthentification`
- `ServiceSessionAuthentification`
- `ServiceSecuriteSessionAuthentification`
- `ServiceTotpSuperAdminAuthentification`
- `ServiceAutorisationAuthentification`
- `ServiceAuditAuthentification`
- facade: `ServiceAuthentification`

Tous ces services dependent de `InterfaceRepositoryAuthentification`.

## 4.1 DTO regroupes par module

Les DTO ne sont plus en micro-fichiers isoles. Ils sont regroupes ici:

- `src/application/dtos/authentification/DtoAuthentification.ts`
- `src/application/dtos/utilisateurs/DtoUtilisateurs.ts`
- `src/application/dtos/administration/DtoAdministration.ts`
- `src/application/dtos/locations/DtoLocations.ts`
- `src/application/dtos/systeme/DtoSysteme.ts`

## 5. Fabriques auth

- `FabriqueSessionAuthentification`
- `FabriqueJetonRefresh`

Elles centralisent la creation d entites auth via builders.

## 6. Choix du driver persistance

Configuration via variable d environnement:

```env
AUTH_PERSISTENCE_DRIVER=prisma
```

Valeurs possibles:

- `prisma` (defaut)
- `memoire`

Pour alimenter le mode memoire en test:

- utiliser `DaoAuthentificationMemoire.ajouterOuRemplacerUtilisateur(...)`
- utiliser `DaoAuthentificationMemoire.ajouterAuditSecurite(...)` si besoin de precharger des audits

Injection dans:

- `src/coeur/conteneur/ConteneurDependances.ts`
- methode de configuration: `ConfigurationApplication.driverPersistanceAuthentification()`

## 7. Compatibilite API

Aucun changement de contrat HTTP:

- endpoints `authContext` inchanges,
- alias `/api/auth/*` inchanges,
- Swagger routes inchangees.

## 8. Verification technique

Commandes executees:

```bash
npx tsc --noEmit
npx eslint .
```

Resultat:

- TypeScript: OK
- ESLint: OK

Note build locale:

- `npm run build` demande Node `>=20.9.0` (environnement local actuel Node 18.19.1).
