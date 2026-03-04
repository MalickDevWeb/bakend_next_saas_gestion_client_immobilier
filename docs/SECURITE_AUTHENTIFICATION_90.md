# Securite Authentification 90

Ce document decrit la couche securite ajoutee au backend:

- vraie 2FA Super Admin via TOTP (Google Authenticator),
- rotation de refresh token avec detection de reutilisation,
- rate limit strict (login / second-auth / refresh),
- hash mot de passe fort (Argon2id),
- cookies securises + CSRF,
- audit securite + alertes webhook,
- RBAC serveur,
- headers securite + CORS strict.

Guide pedagogique complet (fichier par fichier + procedure de test complete):
- `GUIDE_MODULE_AUTHENTIFICATION_DE_A_A_Z.md`

## 1. Endpoints implementes (avec Swagger)

Routes API documentees:

- `POST /api/authContext/login`
- `GET /api/authContext`
- `POST /api/authContext/rafraichir`
- `POST /api/authContext/logout`
- `POST /api/authContext/super-admin/second-auth`
- `POST /api/authContext/super-admin/totp/initialiser`
- `POST /api/authContext/super-admin/totp/activer`
- `GET /api/authContext/super-admin/totp/statut`
- `GET /api/securite/audits` (RBAC serveur + seconde auth)

Compatibilite frontend legacy:

- alias sans prefixe `/api`:
  - `/authContext/*`
  - `/auth/*` (`login`, `session`, `logout`)

Swagger a ete enrichi avec:
- security schemes (`bearerAuth`, `accessTokenCookie`, `refreshTokenCookie`, `csrfHeader`);
- indication claire des endpoints qui exigent `x-csrf-token`;
- injection automatique du header CSRF dans la page `/documentation` quand le cookie existe.

## 2. Base de donnees (sans JSON)

Modeles Prisma ajoutes:

- `Utilisateur`
- `SessionAuthentification`
- `JetonRefresh`
- `TentativeConnexion`
- `JournalAudit`
- `PermissionUtilisateur`

Objectif:

- session et jetons revocables,
- traces securite exploitables,
- permissions serveur persistantes.

## 3. Flux securite

### 3.1 Login

1. Verification anti-bruteforce.
2. Verification Argon2id du mot de passe.
3. Creation session + refresh token hash.
4. Emission cookies:
   - `kya_access_token` (httpOnly),
   - `kya_refresh_token` (httpOnly),
   - `kya_csrf_token` (double submit token).

### 3.2 Rotation refresh + reuse detection

1. Le refresh token presente est recherche par hash.
2. S il est deja revoque/utilise et remplace: compromission detectee.
3. Toute la session est revoquee.
4. Un audit critique est enregistre (`AUTH_REFRESH_REUSE_DETECTED`).

### 3.3 Super Admin 2FA (TOTP)

1. Initialisation: secret temporaire + `otpauth://`.
2. Activation: verification code 6 chiffres.
3. Seconde auth: verification TOTP sur endpoint dedie.
4. TTL 2FA court (configurable, default 60s).

## 4. CSRF + CORS + headers

## 4.1 CSRF

- Middleware global sur routes `POST/PUT/PATCH/DELETE`.
- Exemptions limitees (`/api/authContext/login`, `/api/auth/login`, docs/sante).
- Verification `x-csrf-token` == cookie `kya_csrf_token`.

## 4.2 CORS strict

- `CORS_ORIGINES_AUTORISEES` definit les origines autorisees.
- Origine non autorisee => `403`.
- Preflight `OPTIONS` gere proprement.

## 4.3 Headers securite

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy`
- `Content-Security-Policy`
- `Strict-Transport-Security`

## 5. RBAC serveur

RBAC est applique cote serveur, pas seulement frontend:

- exemple: `GET /api/securite/audits` exige
  - session valide,
  - seconde auth super admin valide si role SUPER_ADMIN,
  - permission `AUDIT_LIRE`.

## 6. Variables d environnement securite

Ajouter ces variables en production:

```env
AUTH_JWT_SECRET=...
AUTH_TOTP_ENCRYPTION_KEY=...
AUTH_ACCESS_TOKEN_TTL_SEC=900
AUTH_SESSION_TTL_SEC=604800
AUTH_REFRESH_TOKEN_TTL_SEC=2592000
AUTH_SUPER_ADMIN_2FA_TTL_MS=60000
AUTH_MAX_FAILED_ATTEMPTS=5
AUTH_FAILED_WINDOW_SEC=600
AUTH_LOCK_DURATION_SEC=900
AUTH_COOKIE_SAME_SITE=strict
CORS_ORIGINES_AUTORISEES=https://ton-frontend.com,https://admin.ton-frontend.com
ALERTE_SECURITE_WEBHOOK_URL=
AUTH_PERSISTENCE_DRIVER=prisma
SEED_SUPER_ADMIN_UTILISATEUR=superadmin
SEED_SUPER_ADMIN_EMAIL=superadmin@kya.local
SEED_SUPER_ADMIN_MOT_DE_PASSE=SuperAdmin@123456
```

## 7. Commandes

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npx tsc --noEmit
npm run lint
```

## 8. Notes importantes

- WebAuthn/passkey n est pas encore implemente dans ce lot.
- Le mode courant est TOTP (vraie 2FA).
- Aucune colonne JSON n a ete ajoutee.

## 9. Respect strict architecture POO (important)

Regle appliquee:

- Les fichiers `app/api/**/route.ts` ne font que l adaptation HTTP:
  - lecture requete (cookies, headers, query, body),
  - appel du controleur,
  - retour HTTP.
- Toute logique metier est dans `src/controleurs` puis `src/application/services`.
- Aucun acces direct Prisma dans les routes API.
- Middleware racine `middleware.ts` est uniquement un point d entree; la logique middleware est centralisee dans `src/infrastructure/middlewares/MiddlewareGlobal.ts`.

Exemples corriges:

- `GET /api/authContext/super-admin/totp/statut` passe maintenant par `ControleurAuthContext` + `ServiceAuthentification`.
- `GET /api/securite/audits` passe maintenant par `ControleurAuthContext` + `ServiceAuthentification` (RBAC et lecture audit).

## 10. Centralisation messages et codes HTTP

Toutes les erreurs utilisateur visibles sont centralisees dans `src/messages`:

- Codes HTTP: `src/messages/app/code.http.ts`
- Messages d erreurs auth/securite: `src/messages/app/errors.ts`

Exemple:

- `Refresh token deja utilise` ne sort plus d une chaine en dur dans le service.
- Le service utilise `t(ERRORS.AUTH_REFRESH_DEJA_UTILISE)` + `CODE_HTTP.NON_AUTHENTIFIE`.

## 11. Validation et mappeur selon dossiers dedies

- Validation auth infrastructure: `src/infrastructure/validateurs/ValidateurAuthentificationZod.ts`
- Facade validation application: `src/application/validateurs/ValidateurAuthentification.ts`
- Mappeur auth dedie: `src/application/mappers/MappeurUtilisateurAuthentification.ts`

Le `ServiceAuthentification` ne contient plus de mappeur prive interne: il consomme le mappeur du dossier `mappers`.

## 12. Try/Catch centralise (routes API)

Pour eviter la repetition de `try/catch` dans chaque route API:

- utilitaire unique: `src/infrastructure/http/executerAvecGestionErreurs.ts`
- principe: la route passe sa logique metier a l utilitaire, et l utilitaire convertit toute exception via `ReponseHttp.erreur(...)`.

Resultat:

- routes plus courtes,
- gestion d erreur uniforme,
- plus de duplication `try/catch` dans `app/api/**/route.ts`.

## 13. Exceptions application dediees a l authentification

Exceptions ajoutees dans `src/application/exceptions`:

- `ExceptionAuthentification`
- `ExceptionAuthentificationValidation`
- `ExceptionAuthentificationAutorisation`
- `ExceptionAuthentificationPrecondition`
- `ExceptionAuthentificationLimiteTentatives`

Utilisation:

- `ServiceAuthentification` leve ces exceptions metier auth.
- `ValidateurAuthentificationZod` leve `ExceptionAuthentificationValidation`.
- `AdaptateurRequeteSecurite` leve les exceptions auth appropriees.

Le traitement HTTP reste uniforme via `ReponseHttp.erreur(...)` et le wrapper route `executerAvecGestionErreurs`.

## 14. Architecture auth 100 pourcent couches

Flux applique:

1. Route HTTP (`app/api/authContext/**`)
2. Controleur (`ControleurAuthContext`)
3. Validateur (`ValidateurAuthentification` + Zod)
4. Services applicatifs auth
5. Repository auth (`InterfaceRepositoryAuthentification`)
6. DAO auth (`InterfaceDaoAuthentification`)
7. DAO Prisma ou DAO Memoire
8. Mapping persistance vers domaine via entities + builders + objets valeur

Regles appliquees:

- aucun acces direct Prisma dans `src/application/services/**`;
- services auth dependants d interfaces;
- donnees auth metier manipulees via entites domaine.

## 15. Repository + DAO (separation stricte)

Nouveaux contrats:

- `src/domaine/interfaces/repository/InterfaceRepositoryAuthentification.ts`
- `src/domaine/interfaces/dao/InterfaceDaoAuthentification.ts`

Implementations:

- DAO Prisma: `src/infrastructure/dao/prisma/DaoAuthentificationPrisma.ts`
- DAO Memoire: `src/infrastructure/dao/memoire/DaoAuthentificationMemoire.ts`
- Repository Prisma: `src/infrastructure/repositories/prisma/RepositoryAuthentificationPrisma.ts`
- Repository Memoire: `src/infrastructure/repositories/memoire/RepositoryAuthentificationMemoire.ts`

Driver selectionne par environnement:

- `AUTH_PERSISTENCE_DRIVER=prisma|memoire`
- par defaut: `prisma`

## 16. Decoupage SRP applique (fin du God Service)

`ServiceAuthentification` est maintenant une facade uniquement.

Logique extraite dans des services specialises:

- `src/application/services/authentification/ServiceContexteAuthentification.ts`
  - resolution contexte utilisateur + session depuis jeton acces.
- `src/application/services/authentification/ServiceSecuriteSessionAuthentification.ts`
  - rate limit, tentatives, blocage, detection reutilisation refresh.
- `src/application/services/authentification/ServiceSessionAuthentification.ts`
  - connexion, refresh, deconnexion.
- `src/application/services/authentification/ServiceTotpSuperAdminAuthentification.ts`
  - initialisation TOTP, activation, seconde auth, statut TOTP.
- `src/application/services/authentification/ServiceAutorisationAuthentification.ts`
  - verification permission, exigence seconde auth super admin.
- `src/application/services/authentification/ServiceAuditAuthentification.ts`
  - listing audits securite.

## 17. DIP renforce sur services securite (interfaces)

Le code application ne depend plus des classes concretes infra pour les services critiques.

Interfaces ajoutees dans `src/coeur/interfaces`:

- `InterfaceServiceHachageMotDePasse`
- `InterfaceServiceJetonAcces`
- `InterfaceServiceTotp`
- `InterfaceServiceChiffrement`
- `InterfaceServiceAuditSecurite`
- `InterfaceUtilitairesSecurite`

Implementations infrastructure raccordees:

- `ServiceHachageMotDePasseArgon2`
- `ServiceJetonAccesJwt`
- `ServiceTotp`
- `ServiceChiffrementSymetrique`
- `ServiceAuditSecurite`
- `UtilitairesSecurite`

## 18. Domaine auth: entities, builders, objets valeur

Entites auth utilisees en runtime:

- `EntiteUtilisateurAuthentification`
- `EntitePermissionUtilisateurAuth`
- `EntiteSessionAuthentification`
- `EntiteJetonRefresh`
- `EntiteTentativeConnexion`
- `EntiteAuditSecuriteAuthentification`

Builders auth:

- `BuilderEntiteUtilisateurAuthentification`
- `BuilderEntitePermissionUtilisateurAuth`
- `BuilderEntiteSessionAuthentification`
- `BuilderEntiteJetonRefresh`
- `BuilderEntiteTentativeConnexion`
- `BuilderEntiteAuditSecuriteAuthentification`

Objets valeur auth:

- `ObjetValeurIdentifiantConnexion`
- `ObjetValeurAgentUtilisateur`
- `ObjetValeurJetonAccesJti`
- `ObjetValeurHachageJetonRefresh`

Fabriques applicatives auth:

- `FabriqueSessionAuthentification`
- `FabriqueJetonRefresh`

Le cablage est centralise dans:

- `src/coeur/conteneur/ConteneurDependances.ts`
