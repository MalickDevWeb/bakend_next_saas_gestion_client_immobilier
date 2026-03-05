# Prompt Maitre Implementation Fonctionnalite

Ce document est la reference officielle a donner a une IA quand tu veux implementer une fonctionnalite sans oubli.

Regle d usage:
- ce prompt est obligatoire pour chaque nouvelle fonctionnalite;
- aucune implementation ne commence sans suivre ses etapes.

Objectif:
- imposer ton architecture;
- imposer SOLID + Clean Code;
- imposer la centralisation (types, messages, erreurs, interfaces, conteneur);
- imposer la documentation + Swagger + validation finale.

---

## 1) Prompt pret a copier-coller (version complete)

Copie-colle ce prompt tel quel dans ton IA, puis remplace uniquement les champs entre `{{...}}`.

```txt
Tu es un architecte backend TypeScript Next.js.
Tu dois implementer la fonctionnalite "{{NOM_FONCTIONNALITE}}" dans le module "{{MODULE}}" en respectant STRICTEMENT mon architecture (POO + SOLID + Clean Code).

Contrainte absolue:
1. Aucune classe > 200 lignes (cible 100-150 max).
2. SRP strict: une classe = une responsabilite.
3. Noms en francais clairs (fichiers, classes, variables, methodes).
4. Aucun code procedural cache dans une mega-classe.
5. Aucune logique metier dans les routes API.
6. Aucune requete Prisma directe dans les services applicatifs.
7. Utiliser interfaces + injection de dependances + conteneur central.
8. Centraliser tous les messages, erreurs, codes HTTP.
9. Interdire tout texte metier/erreur en dur dans services/controleurs/routes.
10. Utiliser obligatoirement `t(...)` + cles de `src/messages/**`.
11. Types centralises dans `src/domaine/types`.
12. Validation obligatoire (application + infrastructure validateurs).
13. Documentation obligatoire (docs + Swagger) pour chaque endpoint ou regle metier.
14. La fonctionnalite doit etre testable de bout en bout.
15. Interdit de passer a la fonctionnalite suivante sans tests executes et traces.
16. Si score qualite < 80%, corriger et relancer jusqu a >= 80%.

Architecture cible a respecter:
- app/api/** -> adaptation HTTP uniquement
- src/controleurs/** -> orchestration des cas d usage
- src/application/** -> services, DTO, mappers, fabriques, validateurs, exceptions
- src/domaine/** -> entites, objets valeur, builders, types, interfaces (dao/repository), exceptions metier
- src/infrastructure/** -> dao/repositories/prisma/memoire, securite, validateurs, middleware, utils, http helpers
- src/coeur/** -> configuration, conteneur, erreurs/exceptions techniques, interfaces transverses
- src/messages/** -> messages, labels, erreurs, validations, code HTTP centralise
- docs/** -> guide de la fonctionnalite + mise a jour index + swagger/documentation

Methode obligatoire (A -> Z) :

ETAPE 0 - ANALYSE
1. Parcourir dossier par dossier et lister les fichiers impactes.
2. Produire une carte de flux: Route -> Controleur -> Validateur -> Service -> Repository -> DAO -> DB -> Mapper -> DTO.
3. Verifier les conventions existantes (noms, exceptions, messages, types).

ETAPE 1 - MODELE DOMAINE
1. Creer/mettre a jour:
   - entites domaine
   - objets valeur (validation des invariants)
   - builders
   - types centralises
   - exceptions domaine
2. Interdire les "Record<string, unknown>" comme modele metier central quand une entite est necessaire.

ETAPE 2 - CONTRATS
1. Definir interfaces repository et dao dans domaine/interfaces.
2. Signature explicite de chaque methode (pas de any implicite).

ETAPE 3 - COUCHE APPLICATION
1. Creer DTO d entree/sortie par module.
2. Creer mappeurs entite <-> DTO.
3. Creer fabriques si creation d entites complexe.
4. Creer validateurs application.
5. Creer exceptions application specifiques.
6. Decouper services par responsabilite (aucun god service).
7. Ajouter facade courte si necessaire.

ETAPE 4 - INFRASTRUCTURE
1. Implementer DAO (memoire/prisma selon le projet).
2. Implementer repository(s) qui convertissent persistance <-> domaine.
3. Utiliser validateurs infra (Zod, etc.).
4. Ajouter utilitaires HTTP/middleware si requis.

ETAPE 5 - COEUR
1. Brancher toutes les nouvelles dependances dans le conteneur.
2. Utiliser interfaces coeur pour DIP.
3. Centraliser erreurs techniques/coeur.

ETAPE 6 - CONTROLEURS + ROUTES
1. Controleur: orchestration uniquement.
2. Routes app/api: lecture req, appel controleur, reponse.
3. Utiliser wrapper central try/catch.
4. Respecter CSRF/CORS/securite existants.

ETAPE 7 - MESSAGES CENTRALISES
1. Ajouter les cles de messages dans `src/messages/app/errors.ts` / `success.ts` / `validation.ts` selon le besoin.
2. Ajouter ou reutiliser les libelles dans `src/messages/app/*` (`labels.ts`, `actions.ts`, `status.ts`, etc.).
3. Ajouter les codes HTTP dans `src/messages/app/code.http.ts` si besoin.
4. Si validation multilingue: maintenir les cles dans:
   - `src/messages/validation-keys.ts`
   - `src/messages/franchais/validation*.ts`
   - `src/messages/anglais/validation*.ts`
5. Exposer les nouvelles cles via `src/messages/app/index.ts` et `src/messages/index.ts` si necessaire.
6. Interdire les chaines d erreur en dur dans services/controleurs/routes/validateurs.

ETAPE 8 - SWAGGER + DOCS
1. Ajouter/mettre a jour annotations swagger des endpoints.
2. Mettre a jour generateur swagger si nouveau tag.
3. Ajouter un guide docs/guide_module_{{module}}.md:
   - flux complet
   - fichiers modifies
   - exemple requetes/reponses
   - procedure de test
4. Mettre a jour index documentation + portail docs.

ETAPE 9 - TESTS & QUALITE
1. Executer:
   - npm run test:qualite
   - npm run qualite:score
   - (option audit global) QUALITE_PORTEE=projet npm run qualite:score
2. Ajouter ou mettre a jour les tests de la fonctionnalite:
   - unitaires (logique metier/service)
   - integration/API (routes critiques)
   - manuels (Swagger/curl) avec resultat documente
3. Verifier compatibilite frontend (formats payload/reponse).
4. Boucle obligatoire:
   - si `npm run qualite:score` < 80%, refactoriser puis relancer;
   - repeter jusqu a score >= 80%.

ETAPE 10 - LIVRABLE
1. Donner la liste des fichiers modifies.
2. Donner les raisons de chaque changement.
3. Donner les endpoints ajoutes/modifies.
4. Donner la checklist de verification post-deploiement.
5. Aucun travail partiel: implementation complete uniquement.

Definition of Done (obligatoire):
- compile + lint OK;
- SRP respecte;
- classes courtes;
- couches toutes utilisees;
- messages/erreurs centralises;
- Swagger + docs a jour;
- flux frontend compatible.
```

---

## 2) Checklist anti-oubli (a cocher)

## 2.1 Domaine
- [ ] `src/domaine/entites/{{module}}/*`
- [ ] `src/domaine/objets_valeur/{{module}}/*`
- [ ] `src/domaine/builders/{{module}}/*`
- [ ] `src/domaine/types/{{module}}/*`
- [ ] `src/domaine/exceptions/*` (si nouvelle regle metier)
- [ ] `src/domaine/interfaces/dao/{{module}}/*`
- [ ] `src/domaine/interfaces/repository/*`

## 2.2 Application
- [ ] `src/application/dtos/{{module}}/*`
- [ ] `src/application/mappers/*`
- [ ] `src/application/fabriques/*` (si creation complexe)
- [ ] `src/application/validateurs/*`
- [ ] `src/application/exceptions/*`
- [ ] `src/application/services/{{module}}/*` (services decoupes + facade)

## 2.3 Infrastructure
- [ ] `src/infrastructure/dao/*/{{module}}/*`
- [ ] `src/infrastructure/repositories/*/{{module}}/*`
- [ ] `src/infrastructure/validateurs/*`
- [ ] `src/infrastructure/http/*`
- [ ] `src/infrastructure/middlewares/*` (si necessaire)

## 2.4 Coeur
- [ ] `src/coeur/interfaces/*` (si nouveau contrat transverse)
- [ ] `src/coeur/erreurs/*` / `src/coeur/exceptions/*`
- [ ] `src/coeur/conteneur/ConteneurDependances.ts`
- [ ] `src/coeur/configuration/*` (si nouvelle variable env)

## 2.5 Interface HTTP
- [ ] `src/controleurs/*` (ou nouveau controleur)
- [ ] `app/api/{{routes}}/*` (routes minces)
- [ ] alias routes sans `/api` si le frontend en depend

## 2.6 Messages centralises
- [ ] `src/messages/app/errors.ts` (erreurs)
- [ ] `src/messages/app/success.ts` (succes)
- [ ] `src/messages/app/validation.ts` (validation)
- [ ] `src/messages/app/code.http.ts` (codes HTTP)
- [ ] `src/messages/app/index.ts` + `src/messages/index.ts` (exports)
- [ ] `src/messages/validation-keys.ts` (cles de validation)
- [ ] `src/messages/franchais/validation*.ts` (FR)
- [ ] `src/messages/anglais/validation*.ts` (EN)
- [ ] zero texte en dur dans services/controleurs/routes

## 2.7 Prisma / seed
- [ ] `prisma/schema.prisma` (si modele persistant)
- [ ] `prisma/seeders/*` (donnees initiales/permissions)
- [ ] `prisma/seed.mjs`

## 2.8 Documentation
- [ ] guide module: `docs/GUIDE_MODULE_{{MODULE}}_DE_A_A_Z.md`
- [ ] `docs/INDEX_DOCUMENTATION_COMPLETE.md`
- [ ] `app/docs/_lib/documentation.ts`
- [ ] swagger: annotations + tags + endpoint visible dans `/documentation`

## 2.9 Qualite finale
- [ ] `npm run test:qualite`
- [ ] `npm run qualite:score` >= 80%
- [ ] tests unitaires/integration de la fonctionnalite
- [ ] test manuel API (login/context/mutations/rollback si applicable)
- [ ] verifier compatibilite exacte avec payloads frontend

---

## 3) Regles de decoupage des classes (strict)

Si une classe depasse 200 lignes ou couvre plusieurs contextes:

1. Creer une facade courte.
2. Extraire des services specialisees:
   - ServiceContexte...
   - ServiceValidation...
   - ServiceCommande...
   - ServiceLecture...
   - ServiceAudit...
3. Garder le controleur fin.
4. Deplacer utilitaires de mapping/normalisation dans mappers/fabriques/objets valeur.

Exemple:
- `Service{{Module}}` = facade
- `Service{{Module}}Metier` = orchestration metier courte
- `Service{{Module}}Operations{{Contexte}}` = operations detaillees

---

## 4) Contrat de reponse attendu de l IA

Toujours finir par:

1. **Ce qui a ete implemente** (fonctionnel).
2. **Fichiers modifies** (liste exacte).
3. **Pourquoi** chaque bloc existe (SRP/DIP).
4. **Endpoints** ajoutes/modifies.
5. **Validation** (`npm run test:qualite` + tests fonctionnalite).
6. **Resultats de test** (table cas -> statut).
7. **Prochaines etapes** (si refactor restant).

---

## 5) Commandes standard de verification

```bash
npm run test:qualite
npm run qualite:score
```

Si schema modifie:

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

---

## 6) Matrice obligatoire dossier par dossier

Cette matrice force l IA a ne rien oublier.

### 6.1 `src/domaine`

- `entites/{{module}}/*`: modele metier pur, methodes metier uniquement.
- `objets_valeur/{{module}}/*`: validation locale, immutabilite, invariants.
- `builders/{{module}}/*`: construction explicite des entites.
- `types/{{module}}/*`: tous les types metier partages.
- `interfaces/dao/{{module}}/*`: contrats persistance techniques.
- `interfaces/repository/*`: contrats metier de persistance.
- `exceptions/*`: erreurs metier explicites.

### 6.2 `src/application`

- `dtos/{{module}}/*`: payloads entree/sortie de cas d usage.
- `mappers/*`: conversion Entite <-> DTO.
- `fabriques/*`: creation complexe d objets metier.
- `validateurs/*`: validation des commandes applicatives.
- `exceptions/*`: erreurs applicatives.
- `services/{{module}}/*`: orchestration cas d usage (pas d acces DB direct).

### 6.3 `src/infrastructure`

- `dao/prisma/{{module}}/*` et `dao/memoire/{{module}}/*`: impl DAO.
- `repositories/prisma/{{module}}/*` et `repositories/memoire/{{module}}/*`: mapping persistance <-> domaine.
- `validateurs/*`: validateurs Zod/infra.
- `middlewares/*`: pipeline HTTP transverses.
- `http/*`: wrappers reponse/erreur/adapter requete.
- `base_de_donnees/*`: adaptateur client DB.

### 6.4 `src/coeur`

- `configuration/*`: lecture env + valeurs par defaut.
- `interfaces/*`: contrats transverses (DIP).
- `exceptions/*` et `erreurs/*`: socle technique.
- `conteneur/ConteneurDependances.ts`: cablage unique.

### 6.5 HTTP + docs + messages

- `src/controleurs/*`: orchestration couche interface.
- `app/api/**/route.ts`: adaptation HTTP pure.
- `src/messages/**`: tout texte visible + code HTTP + erreurs.
- `src/messages/app/index.ts` + `src/messages/index.ts`: exports centralises obligatoires.
- `src/messages/validation-keys.ts` + dossiers FR/EN: cles de validation synchronisees.
- `docs/*`: guide module + mise a jour index.
- `app/docs/_lib/documentation.ts`: exposition sur portail docs.
- Swagger: endpoint visible dans `/documentation`.

---

## 7) Squelettes minimaux par fichier (templates)

Ces squelettes sont obligatoires quand le fichier est cree.

### 7.1 Type domaine

```ts
export type TypeStatut{{Nom}} = 'ACTIF' | 'INACTIF'
```

### 7.2 DTO

```ts
export type DtoCreation{{Nom}} = {
  champObligatoire: string
}
```

### 7.3 Entite

```ts
export class Entite{{Nom}} {
  constructor(
    public readonly id: string,
    public libelle: string
  ) {}
}
```

### 7.4 Builder

```ts
export class BuilderEntite{{Nom}} {
  private id = ''
  private libelle = ''

  public avecId(valeur: string): this {
    this.id = valeur
    return this
  }

  public avecLibelle(valeur: string): this {
    this.libelle = valeur
    return this
  }

  public build(): Entite{{Nom}} {
    return new Entite{{Nom}}(this.id, this.libelle)
  }
}
```

### 7.5 Interface DAO

```ts
export interface InterfaceDao{{Nom}} {
  creer(entree: TypeCommandeCreation{{Nom}}): Promise<Entite{{Nom}}>
  trouverParId(id: string): Promise<Entite{{Nom}} | null>
}
```

### 7.6 Interface Repository

```ts
export interface InterfaceRepository{{Nom}} {
  creer(entree: TypeCommandeCreation{{Nom}}): Promise<Entite{{Nom}}>
  obtenirParId(id: string): Promise<Entite{{Nom}} | null>
}
```

### 7.7 Service applicatif

```ts
export class Service{{Nom}} {
  constructor(private readonly repository: InterfaceRepository{{Nom}}) {}

  public async creer(dto: DtoCreation{{Nom}}): Promise<Dto{{Nom}}> {
    const entite = await this.repository.creer({ ...dto })
    return this.mappeur.versDto(entite)
  }
}
```

### 7.8 Controleur

```ts
export class Controleur{{Nom}} {
  constructor(private readonly service: Service{{Nom}}) {}

  public async creer(entree: DtoCreation{{Nom}}): Promise<Dto{{Nom}}> {
    return this.service.creer(entree)
  }
}
```

### 7.9 Route Next

```ts
export async function POST(request: Request) {
  return executerAvecGestionErreurs(async () => {
    const body = await request.json()
    const reponse = await conteneur.controleur{{Nom}}.creer(body)
    return ReponseHttp.succes(reponse)
  })
}
```

---

## 8) Sortie standard imposee a l IA (format de livraison)

Toujours imposer ce format a la fin:

1. Resume fonctionnel.
2. Liste des fichiers modifies, couche par couche.
3. Endpoints ajoutes/modifies + exemples request/response.
4. Messages centralises ajoutes.
5. Variables env ajoutees/modifiees.
6. Resultat `tsc` + `lint` + tests.
7. Etapes de test manuel.

---

## 9) Regle anti-derive (rappel critique)

- Interdit: logique metier dans route/controller.
- Interdit: Prisma direct dans `src/application/services/**`.
- Interdit: strings hardcodees pour erreurs/succes.
- Interdit: classe monolithique > 200 lignes.
- Interdit: `any` implicite.
- Obligatoire: documenter toute modification dans `docs/*`.
- Interdit: passer a la fonctionnalite suivante sans resultat de test explicite.
- Interdit: accepter un score qualite < 80%.

---

## 10) Protocole strict de centralisation des messages

Quand une nouvelle fonctionnalite introduit un nouveau message:

1. Ajouter la cle metier dans le bon fichier `src/messages/app/*`.
2. Si c est un message de validation, ajouter aussi la cle dans:
   - `src/messages/validation-keys.ts`
   - `src/messages/franchais/validation*.ts`
   - `src/messages/anglais/validation*.ts`
3. Exposer la nouvelle cle dans `src/messages/app/index.ts` puis `src/messages/index.ts`.
4. Utiliser la cle dans le code via `t(...)`.
5. Verifier qu aucun texte visible n est ecrit en dur dans le code metier.

Mini checklist de controle:

- [ ] cle declaree dans `src/messages/app/*`
- [ ] export ajoute
- [ ] traduction FR/EN synchronisee (si validation)
- [ ] utilisation via `t(...)`
- [ ] aucun literal string metier restant
