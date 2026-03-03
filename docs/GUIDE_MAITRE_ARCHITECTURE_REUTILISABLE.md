# Guide Maitre: Architecture Backend Reutilisable (Explication Simple)

## 1. Pourquoi cette documentation existe

But: permettre a n'importe qui (meme debutant) de:
- comprendre le projet actuel
- reproduire exactement la meme architecture sur un nouveau projet
- repartir d'une base propre sans casser la logique metier

## 2. Image mentale tres simple (comme pour un enfant)

Imagine une ville:
- `app/` = la porte d'entree de la ville (les routes HTTP)
- `middleware.ts` = le garde a l'entree (filtre avant les routes API)
- `src/controleurs/` = l'accueil qui ecoute la demande
- `src/application/` = le chef d'orchestre qui decide quoi faire
- `src/domaine/` = les regles du jeu (le coeur metier)
- `src/infrastructure/` = les outils concrets (base de donnees, validations techniques)
- `src/coeur/` = les pieces communes (configuration, interfaces, exceptions, conteneur)
- `src/messages/` = le dictionnaire central de mots/messages
- `docs/` = le manuel de la ville

Regle d'or:
- la "porte" ne decide pas les regles metier
- les regles metier ne dependent pas de la porte

## 3. Principes techniques appliques

- POO: classes, responsabilites claires, encapsulation
- SOLID:
  - SRP: un fichier = une mission principale
  - OCP: on ajoute de nouvelles implementations sans casser l'existant
  - LSP: une implementation respecte le contrat de son interface
  - ISP: interfaces petites et utiles
  - DIP: les couches hautes dependent d'interfaces, pas de details techniques

## 4. Regles de nommage obligatoires

- tout est en francais lisible
- 1 classe principale par fichier
- nom fichier = nom classe
- prefixes de famille:
  - `Entite*`
  - `BuilderEntite*`
  - `ObjetValeur*`
  - `Dto*`
  - `InterfaceDao*`
  - `Dao*Memoire`
  - `Exception*`
  - `Service*`, `Controleur*`, `Validateur*`, `Fabrique*`, `Mappeur*`

## 5. Flux d'une requete (debut a fin)

1. Le client appelle une route `app/api/.../route.ts`
2. Le `middleware.ts` applique les middlewares globaux API
3. La route appelle un controleur
4. Le controleur valide l'entree (via interface)
5. Le controleur appelle un service applicatif
6. Le service utilise le domaine (entites, objets valeur, builders)
7. Le service passe par une interface DAO/referentiel
8. L'infrastructure execute (memoire/Prisma/Zod)
9. Le resultat est converti en DTO
10. La route renvoie le JSON

## 6. Reproduire cette architecture sur un nouveau projet (pas a pas)

### Etape A - Initialiser

```bash
npx create-next-app@latest mon-backend --typescript --eslint
cd mon-backend
```

### Etape B - Creer les dossiers cibles

```bash
mkdir -p app/api/sante
mkdir -p docs prisma
mkdir -p src/application/{dtos,exceptions,fabriques,mappers,services,validateurs}
mkdir -p src/coeur/{configuration,conteneur,erreurs,exceptions,interfaces}
mkdir -p src/controleurs
mkdir -p src/documentation
mkdir -p src/domaine/{builders,entites,enumerations,exceptions,interfaces/dao,objets_valeur,types}
mkdir -p src/infrastructure/{base_de_donnees,dao/memoire,exceptions,faker,referentiels,utils,validateurs}
mkdir -p src/infrastructure/middlewares
mkdir -p src/messages/{app,franchais,anglais}
mkdir -p src/tests
```

### Etape C - Commencer petit

1. cree `ServiceSante`
2. cree `ControleurSante`
3. cree `ConteneurDependances`
4. branche `app/api/sante/route.ts`
5. ajoute Swagger (`/api/documentation` + `/documentation`)
6. ajoute les interfaces techniques (`InterfaceClientBaseDeDonnees`, `InterfaceValidateurEntree`)

### Etape D - Ajouter le domaine

1. creer `ObjetDomaine` (equals/toString/toJSON)
2. creer les `Entite*`
3. creer les `ObjetValeur*`
4. creer les `BuilderEntite*`
5. creer `Dto*`
6. creer `InterfaceDao*` + `Dao*Memoire`

### Etape E - Ajouter la base de donnees

1. installer Prisma
2. definir `prisma/schema.prisma`
3. placer `DATABASE_URL` dans `.env`
4. `npm run prisma:generate`
5. brancher un adaptateur infrastructure

## 7. Le role de chaque grande zone

### `app/`

Mission: adaptateur HTTP Next.js uniquement.
Ne pas mettre la logique metier lourde ici.

### `src/domaine/`

Mission: coeur metier pur.
Le domaine ne doit pas connaitre Next.js ni Prisma.

### `src/application/`

Mission: orchestration metier (cas d'usage).
Le service decide quel objet metier utiliser et dans quel ordre.

### `src/infrastructure/`

Mission: realiser les operations techniques concretes.
Ex: Prisma, Zod, DAO memoire.

Sous-module important:
- `src/infrastructure/middlewares`: middlewares API (journalisation, maintenance, etc.)

### `src/coeur/`

Mission: pieces transverses et communes.
Ex: conteneur, interfaces, exceptions communes, configuration.

### `src/messages/`

Mission: centraliser tous les messages FR/EN.
Regle: importer depuis `@/src/messages` (facade), pas des chemins profonds.

## 8. Contrat de qualite avant chaque commit

Verifier:

```bash
npm run lint
npx tsc --noEmit
```

Si tu ajoutes une route:
- ajouter doc swagger
- ajouter messages eventuels
- verifier que le service depend d'interfaces (pas d'implementation directe)

## 9. Comment evoluer sans casser

- nouveau stockage? ajoute une nouvelle implementation DAO
- nouvelle validation? adapte validateur infra + schema
- nouvelle regle metier? change d'abord domaine/application
- nouveaux messages? ajoute dans `src/messages/*`

## 10. Anti-patterns interdits

- mettre du SQL/Prisma directement dans `app/api/*`
- mettre des textes hardcodes partout
- dependre d'une classe concrete dans un service (quand une interface existe)
- ajouter une entite sans builder ni DTO
- contourner les objets valeur pour des champs sensibles (email, telephone, montant...)

## 11. Mini checklist “copier-coller” pour tout nouveau module

1. Entite: `EntiteXxx`
2. Builder: `BuilderEntiteXxx`
3. DTO: `DtoXxx`
4. Interface DAO: `InterfaceDaoXxx`
5. DAO memoire: `DaoXxxMemoire`
6. Service: `ServiceXxx`
7. Controleur: `ControleurXxx`
8. Route: `app/api/xxx/route.ts`
9. Messages: `src/messages/app/*` et/ou validation FR/EN
10. Swagger + lint + tsc

## 12. Point important sur les "captures"

Dans cette documentation, les captures sont fournies sous forme de:
- captures textuelles d'arborescence
- captures de flux (schemas mermaid)
- captures d'extraits de code

Elles sont stables, versionnables, et reproductibles directement dans Git.
