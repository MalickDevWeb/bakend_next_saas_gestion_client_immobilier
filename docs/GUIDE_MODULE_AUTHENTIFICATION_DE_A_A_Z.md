# Guide Module Authentification De A A Z

Objectif de ce guide:
- expliquer le module authentification de maniere tres claire;
- montrer le role de chaque dossier et fichier utilise;
- permettre a une personne debutante de reproduire le module sur un autre projet;
- donner une procedure de test complete (Swagger + cookies + CSRF + TOTP).

Ce guide est volontairement detaille.

Pour les fonctionnalites metier admin (clients, documents, paiements, settings, undo...),
voir aussi: `GUIDE_MODULE_ADMIN_DE_A_A_Z.md`.

---

## 1. Idee simple (version enfant de 5 ans)

Imagine une maison:
- la **porte** = les routes API (`app/api/**`);
- le **gardien** = le controleur (`src/controleurs`);
- le **verificateur** = les validateurs (`src/application/validateurs` + `src/infrastructure/validateurs`);
- le **cerveau** = les services (`src/application/services/authentification`);
- le **traducteur metier** = repository (`src/infrastructure/repositories`);
- le **chauffeur base de donnees** = DAO (`src/infrastructure/dao`);
- le **coffre fort** = securite (hash, JWT, TOTP, CSRF, cookies, CORS, headers);
- le **registre de police** = journal audit.

Tu passes toujours dans cet ordre:

Route -> Controleur -> Validateur -> Service -> Repository -> DAO -> Base de donnees

---

## 2. Type d architecture securite utilisee

Ce backend n est **pas 100% stateless**.

Il est hybride:
- token-based (JWT access token + refresh token);
- **stateful** cote serveur (sessions et refresh conserves en base).

Pourquoi:
- pouvoir revoquer une session;
- detecter la reutilisation d un refresh token;
- faire logout reel;
- appliquer un anti brute-force;
- tracer les audits securite.

---

## 3. Flux complet d authentification

### 3.1 Connexion

1. Client appelle `POST /api/authContext/login`.
2. Route lit `identifiant` (telephone ou email) et `motDePasse`.
3. Controleur valide la charge utile.
4. Service session:
   - verifie blocage anti brute-force;
   - charge utilisateur;
   - verifie mot de passe Argon2id;
   - cree session + refresh;
   - genere JWT access token + csrf token;
   - enregistre audit.
5. Route ecrit cookies:
   - `kya_access_token` (httpOnly),
   - `kya_refresh_token` (httpOnly),
   - `kya_csrf_token` (lisible JS pour double-submit CSRF).
6. Reponse JSON retourne `user`.

### 3.2 Lecture contexte session

1. Client appelle `GET /api/authContext`.
2. Adaptateur securite lit access token depuis cookie ou Authorization Bearer.
3. Service contexte:
   - verifie JWT;
   - charge session en base;
   - verifie non revoquee, non expiree, non compromise;
   - compare JTI courant.
4. Reponse retourne `user`.

### 3.3 Refresh token rotation

1. Client appelle `POST /api/authContext/rafraichir` avec header CSRF.
2. Serveur lit refresh token cookie.
3. Service session:
   - hash refresh recu;
   - charge token stocke;
   - bloque si deja utilise/revoque;
   - si reutilisation detectee: compromission, revocation complete;
   - cree nouveau refresh + nouveau JTI + nouveau CSRF;
   - invalide ancien refresh.
4. Route reecrit les cookies.

### 3.4 Logout

1. Client appelle `POST /api/authContext/logout` avec header CSRF.
2. Service session revoque session + refresh.
3. Route supprime cookies.

### 3.5 Super Admin 2FA TOTP

1. `POST /api/authContext/super-admin/totp/initialiser`
   - cree `secretTemporaire` + `otpAuthUrl`.
2. `POST /api/authContext/super-admin/totp/activer`
   - verifie code 6 chiffres;
   - chiffre secret;
   - stocke secret chiffre.
3. `POST /api/authContext/super-admin/second-auth`
   - verifie code TOTP;
   - marque session comme seconde auth validee.
   - mode compatibilite frontend: accepte aussi `password`/`motDePasse`.
4. `GET /api/authContext/super-admin/totp/statut`
   - retourne statut actif/non actif.

### 3.6 ADMIN 1FA (sans seconde auth)

1. `ADMIN` utilise le meme endpoint `POST /api/authContext/login`.
2. L identifiant de login peut etre `telephone` ou `email`.
3. La reponse utilisateur retourne:
   - `role: "ADMIN"`
   - `superAdminSecondAuthRequired: false`
4. Au seed initial, `ADMIN` recoit le preset frontend:
   - dashboard, clients, rentals, payments, documents, settings, work, imports, notifications, pdfExport.
5. `ADMIN` est bloque (`403`) sur:
   - `/api/authContext/super-admin/second-auth`
   - `/api/authContext/super-admin/totp/*`

### 3.7 Impersonation Super Admin -> Admin

1. `POST /api/authContext/impersonate`
   - reserve SUPER_ADMIN;
   - active l espace admin cible;
   - verifie que la cible existe en base avec role `ADMIN` et statut `ACTIF`.
2. `POST /api/authContext/clear-impersonation`
   - reserve SUPER_ADMIN;
   - supprime l usurpation en cours.
3. Le contexte `GET /api/authContext` renvoie `impersonation` quand active.

### 3.8 Audit securite

`GET /api/securite/audits`:
- exige auth valide;
- exige seconde auth super admin (si role SUPER_ADMIN);
- exige permission `AUDIT_LIRE`.

---

## 4. Fichiers utilises (liste exhaustive du module)

### 4.1 Entree HTTP (routes)

- `app/api/authContext/login/route.ts`
- `app/api/authContext/route.ts`
- `app/api/authContext/rafraichir/route.ts`
- `app/api/authContext/logout/route.ts`
- `app/api/authContext/impersonate/route.ts`
- `app/api/authContext/clear-impersonation/route.ts`
- `app/api/authContext/super-admin/totp/initialiser/route.ts`
- `app/api/authContext/super-admin/totp/activer/route.ts`
- `app/api/authContext/super-admin/second-auth/route.ts`
- `app/api/authContext/super-admin/totp/statut/route.ts`
- `app/api/securite/audits/route.ts`
- `app/api/sante/route.ts`
- `app/api/documentation/route.ts`

Alias compatibilite:
- `app/api/auth/login/route.ts`
- `app/api/auth/session/route.ts`
- `app/api/auth/logout/route.ts`

### 4.2 Middleware global

- `middleware.ts`
- `src/infrastructure/middlewares/MiddlewareGlobal.ts`

Ce que fait le middleware:
- CORS strict;
- headers securite;
- verification CSRF sur methodes avec corps;
- gestion preflight OPTIONS.

### 4.3 Controleurs

- `src/controleurs/ControleurAuthContext.ts`
- `src/controleurs/ControleurSante.ts`

### 4.4 Validation

Application:
- `src/application/validateurs/ValidateurAuthentification.ts`

Infrastructure (Zod):
- `src/infrastructure/validateurs/ValidateurAuthentificationZod.ts`

### 4.5 Services application (module auth)

- `src/application/services/authentification/ServiceAuthentification.ts` (facade)
- `src/application/services/authentification/ServiceSessionAuthentification.ts`
- `src/application/services/authentification/ServiceContexteAuthentification.ts`
- `src/application/services/authentification/ServiceSecuriteSessionAuthentification.ts`
- `src/application/services/authentification/ServiceTotpSuperAdminAuthentification.ts`
- `src/application/services/authentification/ServiceAutorisationAuthentification.ts`
- `src/application/services/authentification/ServiceAuditAuthentification.ts`
- `src/application/services/authentification/ServiceImpersonationAuthentification.ts`

### 4.6 DTO, mappeur, fabriques

- `src/application/dtos/authentification/DtoAuthentification.ts`
- `src/application/mappers/MappeurUtilisateurAuthentification.ts`
- `src/application/fabriques/FabriqueSessionAuthentification.ts`
- `src/application/fabriques/FabriqueJetonRefresh.ts`

### 4.7 Exceptions

- `src/application/exceptions/ExceptionAuthentification.ts`
- `src/application/exceptions/ExceptionAuthentificationValidation.ts`
- `src/application/exceptions/ExceptionAuthentificationAutorisation.ts`
- `src/application/exceptions/ExceptionAuthentificationPrecondition.ts`
- `src/application/exceptions/ExceptionAuthentificationLimiteTentatives.ts`

### 4.8 Domaine: entites

- `src/domaine/entites/authentification/EntiteUtilisateurAuthentification.ts`
- `src/domaine/entites/authentification/EntitePermissionUtilisateurAuth.ts`
- `src/domaine/entites/authentification/EntiteSessionAuthentification.ts`
- `src/domaine/entites/authentification/EntiteJetonRefresh.ts`
- `src/domaine/entites/authentification/EntiteTentativeConnexion.ts`
- `src/domaine/entites/authentification/EntiteAuditSecuriteAuthentification.ts`

### 4.9 Domaine: objets valeur

- `src/domaine/objets_valeur/authentification/ObjetValeurAdresseIp.ts`
- `src/domaine/objets_valeur/authentification/ObjetValeurAgentUtilisateur.ts`
- `src/domaine/objets_valeur/authentification/ObjetValeurIdentifiantConnexion.ts`
- `src/domaine/objets_valeur/authentification/ObjetValeurJetonAccesJti.ts`
- `src/domaine/objets_valeur/authentification/ObjetValeurHachageJetonRefresh.ts`

### 4.10 Domaine: builders

- `src/domaine/builders/authentification/BuilderEntiteUtilisateurAuthentification.ts`
- `src/domaine/builders/authentification/BuilderEntitePermissionUtilisateurAuth.ts`
- `src/domaine/builders/authentification/BuilderEntiteSessionAuthentification.ts`
- `src/domaine/builders/authentification/BuilderEntiteJetonRefresh.ts`
- `src/domaine/builders/authentification/BuilderEntiteTentativeConnexion.ts`
- `src/domaine/builders/authentification/BuilderEntiteAuditSecuriteAuthentification.ts`

### 4.11 Domaine: types

- `src/domaine/types/authentification/TypeContexteRequeteAuthentification.ts`
- `src/domaine/types/authentification/TypeContexteSessionAuthentification.ts`
- `src/domaine/types/authentification/TypeResultatConnexionAuthentification.ts`
- `src/domaine/types/authentification/TypeResultatRafraichissementAuthentification.ts`
- `src/domaine/types/authentification/TypeResultatTotpInitialisationAuthentification.ts`
- `src/domaine/types/authentification/TypeTentativeConnexionAuthentification.ts`
- `src/domaine/types/authentification/TypeTotpSuperAdminAuthentification.ts`
- `src/domaine/types/authentification/TypeCommandeCreationSessionAuthentification.ts`
- `src/domaine/types/authentification/TypeCommandeRotationJetonRefreshAuthentification.ts`
- `src/domaine/types/authentification/TypeDriverPersistanceAuthentification.ts`

### 4.12 Contrats (interfaces)

DAO:
- `src/domaine/interfaces/dao/authentification/InterfaceDaoAuthentification.ts`

Repository:
- `src/domaine/interfaces/repository/InterfaceRepositoryAuthentification.ts`

Services coeur:
- `src/coeur/interfaces/InterfaceServiceHachageMotDePasse.ts`
- `src/coeur/interfaces/InterfaceServiceJetonAcces.ts`
- `src/coeur/interfaces/InterfaceServiceTotp.ts`
- `src/coeur/interfaces/InterfaceServiceChiffrement.ts`
- `src/coeur/interfaces/InterfaceServiceAuditSecurite.ts`
- `src/coeur/interfaces/InterfaceUtilitairesSecurite.ts`
- `src/coeur/interfaces/InterfaceValidateurAuthentification.ts`

### 4.13 Repositories

- `src/infrastructure/repositories/RepositoryAuthentificationAbstrait.ts`
- `src/infrastructure/repositories/prisma/RepositoryAuthentificationPrisma.ts`
- `src/infrastructure/repositories/memoire/RepositoryAuthentificationMemoire.ts`

### 4.14 DAO

Prisma:
- `src/infrastructure/dao/prisma/authentification/DaoAuthentificationPrisma.ts`

Memoire:
- `src/infrastructure/dao/memoire/authentification/DaoAuthentificationMemoire.ts`

### 4.15 Services securite infra

- `src/infrastructure/securite/ServiceHachageMotDePasseArgon2.ts`
- `src/infrastructure/securite/ServiceJetonAccesJwt.ts`
- `src/infrastructure/securite/ServiceTotp.ts`
- `src/infrastructure/securite/ServiceChiffrementSymetrique.ts`
- `src/infrastructure/securite/ServiceAuditSecurite.ts`
- `src/infrastructure/securite/ServiceAuditSecuriteMemoire.ts`
- `src/infrastructure/securite/ServiceCookiesAuthentification.ts`
- `src/infrastructure/securite/ServiceProtectionCsrf.ts`
- `src/infrastructure/securite/ServiceCorsStrict.ts`
- `src/infrastructure/securite/ServiceEntetesSecuriteHttp.ts`
- `src/infrastructure/securite/AdaptateurRequeteSecurite.ts`
- `src/infrastructure/securite/UtilitairesSecurite.ts`

### 4.16 Infra HTTP

- `src/infrastructure/http/ContexteRequeteHttp.ts`
- `src/infrastructure/http/ReponseHttp.ts`
- `src/infrastructure/http/executerAvecGestionErreurs.ts`

### 4.17 Configuration + conteneur

- `src/coeur/configuration/ConfigurationSecurite.ts`
- `src/coeur/configuration/ConfigurationApplication.ts`
- `src/coeur/conteneur/ConteneurDependances.ts`

### 4.18 Messages centralises

- `src/messages/app/errors.ts`
- `src/messages/app/code.http.ts`
- `src/messages/index.ts`

### 4.19 Prisma schema et seed

- `prisma/schema.prisma`
- `prisma/seed.mjs`
- `prisma/seeders/OrchestrateurSeeders.mjs`
- `prisma/seeders/SeederSecuriteAuthentification.mjs`
- `prisma/seeders/donneesSecuriteAuth.mjs`

---

## 5. Capture de structure (auth uniquement)

```txt
app/api/authContext/
  login/route.ts
  logout/route.ts
  rafraichir/route.ts
  route.ts
  super-admin/
    second-auth/route.ts
    totp/activer/route.ts
    totp/initialiser/route.ts
    totp/statut/route.ts

src/application/services/authentification/
  ServiceAuthentification.ts
  ServiceSessionAuthentification.ts
  ServiceContexteAuthentification.ts
  ServiceSecuriteSessionAuthentification.ts
  ServiceTotpSuperAdminAuthentification.ts
  ServiceAutorisationAuthentification.ts
  ServiceAuditAuthentification.ts

src/infrastructure/repositories/
  RepositoryAuthentificationAbstrait.ts
  prisma/RepositoryAuthentificationPrisma.ts
  memoire/RepositoryAuthentificationMemoire.ts

src/infrastructure/dao/
  prisma/authentification/DaoAuthentificationPrisma.ts
  memoire/authentification/DaoAuthentificationMemoire.ts
```

---

## 6. Comment les couches se branchent (Conteneur)

Le fichier cle est:
- `src/coeur/conteneur/ConteneurDependances.ts`

Il instancie:
1. configurations;
2. DAO Prisma + DAO memoire;
3. repository Prisma + repository memoire;
4. choix du driver (`AUTH_PERSISTENCE_DRIVER`);
5. services securite (hash, JWT, TOTP, audit, cookies, CSRF...);
6. services auth modulaires;
7. facade `ServiceAuthentification`;
8. controleur `ControleurAuthContext`.

Conclusion:
- les routes ne parlent pas a Prisma;
- les services ne parlent pas directement a Prisma;
- services -> repository -> DAO -> persistance.

---

## 7. Variables d environnement (auth)

Exemple:

```env
AUTH_PERSISTENCE_DRIVER=prisma
AUTH_JWT_SECRET=remplacer_par_secret_fort
AUTH_TOTP_ENCRYPTION_KEY=remplacer_par_cle_32_plus
AUTH_ACCESS_TOKEN_TTL_SEC=900
AUTH_SESSION_TTL_SEC=604800
AUTH_REFRESH_TOKEN_TTL_SEC=2592000
AUTH_SUPER_ADMIN_2FA_TTL_MS=60000
AUTH_MAX_FAILED_ATTEMPTS=5
AUTH_FAILED_WINDOW_SEC=600
AUTH_LOCK_DURATION_SEC=900
AUTH_COOKIE_SAME_SITE=strict
CORS_ORIGINES_AUTORISEES=https://ton-front.com
ALERTE_SECURITE_WEBHOOK_URL=

SEED_SUPER_ADMIN_TELEPHONE=771234567
SEED_SUPER_ADMIN_EMAIL=malickteuw.devweb@gmail.com
SEED_SUPER_ADMIN_MOT_DE_PASSE=PaMaT1732771719013
SEED_ADMIN_TELEPHONE=771234568
SEED_ADMIN_EMAIL=admin@kya.local
SEED_ADMIN_MOT_DE_PASSE=Admin@123456
```

---

## 8. Test complet Swagger (ordre officiel)

URL docs:
- `/documentation` pour Swagger;
- `/docs` pour la documentation portail.

Ordre:

1. `GET /api/sante`
2. `POST /api/authContext/login`
3. `GET /api/authContext`
4. `GET /api/authContext/super-admin/totp/statut`
5. `POST /api/authContext/super-admin/totp/initialiser`
6. `POST /api/authContext/super-admin/totp/activer`
7. `POST /api/authContext/super-admin/second-auth`
8. `POST /api/authContext/impersonate`
9. `POST /api/authContext/clear-impersonation`
10. `GET /api/securite/audits?limite=10`
11. `POST /api/authContext/rafraichir`
12. `POST /api/authContext/logout`
13. `GET /api/authContext` (doit echouer apres logout)

Important CSRF:
- pour les POST proteges, envoyer `x-csrf-token` egal au cookie `kya_csrf_token`.
- sur la page `/documentation`, Swagger injecte automatiquement ce header si le cookie existe.

---

## 9. Erreurs frequentes et solution

### 9.1 "Jeton acces manquant"

Cause:
- pas de cookie `kya_access_token`;
- pas d entete `Authorization: Bearer ...`.

Verifier:
- login a bien ete execute;
- cookies presents dans le navigateur.

### 9.2 "CSRF token invalide ou absent"

Cause:
- entete `x-csrf-token` absent;
- entete != cookie `kya_csrf_token`.

### 9.3 "Refresh token deja utilise"

Cause:
- reutilisation d un ancien refresh apres rotation.

Comportement attendu:
- compromission detectee;
- session revoquee.

### 9.4 "Seconde authentification Super Admin requise"

Cause:
- super admin connecte mais 2FA de session non validee (TTL court).

Action:
- appeler endpoint `second-auth` avec code TOTP.

### 9.5 "Acces super admin requis"

Cause:
- utilisateur connecte avec role `ADMIN`;
- appel d un endpoint `/api/authContext/super-admin/*`.

Action:
- ne pas appeler ces endpoints pour un ADMIN;
- continuer avec le flux 1FA (`login`, `contexte`, `refresh`, `logout`).

---

## 10. Regles Clean Code appliquees

1. Centralisation des messages:
   - pas de texte d erreur en dur dans les services;
   - utilisation `t(ERRORS.*)`.
2. Centralisation des codes HTTP:
   - `src/messages/app/code.http.ts`.
3. Try/catch centralise:
   - `executerAvecGestionErreurs`.
4. SRP:
   - services auth decoupes par responsabilite.
5. DIP:
   - services dependent d interfaces.
6. POO:
   - entites + objets valeur + builders utilises.

---

## 11. Reutiliser ce module dans un autre projet (checklist)

Copier ces blocs dans le meme ordre:

1. `src/domaine/entites/authentification`
2. `src/domaine/objets_valeur/authentification`
3. `src/domaine/builders/authentification`
4. `src/domaine/types/authentification`
5. `src/domaine/interfaces/dao/authentification`
6. `src/domaine/interfaces/repository/InterfaceRepositoryAuthentification.ts`
7. `src/application/dtos/authentification`
8. `src/application/exceptions/*Authentification*`
9. `src/application/fabriques/*Authentification*`
10. `src/application/mappers/MappeurUtilisateurAuthentification.ts`
11. `src/application/validateurs/ValidateurAuthentification.ts`
12. `src/application/services/authentification`
13. `src/infrastructure/validateurs/ValidateurAuthentificationZod.ts`
14. `src/infrastructure/repositories/*Authentification*`
15. `src/infrastructure/dao/*/authentification/*`
16. `src/infrastructure/securite/*`
17. `src/infrastructure/http/*`
18. `src/infrastructure/middlewares/MiddlewareGlobal.ts`
19. `src/coeur/configuration/ConfigurationSecurite.ts`
20. `src/coeur/conteneur/ConteneurDependances.ts`
21. routes `app/api/authContext/*`
22. modeles Prisma + seeders auth

Puis:
- ajuster variables `.env`;
- lancer `npm run prisma:generate`;
- lancer `npm run prisma:push`;
- lancer `npm run prisma:seed`;
- tester swagger selon la section 8.

---

## 12. Commandes utiles

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npx tsc --noEmit
npm run lint
npm run dev
```

---

## 13. Resume final

Ce module authentification:
- respecte le flux en couches;
- applique POO + SOLID (SRP, DIP, separation service/repository/DAO);
- fournit une securite solide (Argon2id, JWT + rotation refresh, CSRF, CORS strict, headers, audit, TOTP super admin);
- reste testable et reutilisable avec driver `prisma` ou `memoire`.
