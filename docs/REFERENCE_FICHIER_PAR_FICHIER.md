# Reference Complete Fichier par Fichier

Ce document liste **chaque fichier du projet** (hors `node_modules`, `.next`, `.git`) avec:
- sa couche
- son role explique simplement
- quand le modifier
- comment le reproduire ailleurs.

> Astuce: utilise ce document comme checklist pour reconstruire la meme architecture sur un nouveau projet.

| Fichier | Couche | Role (explication simple) | Quand le modifier | Mode reproduction |
|---|---|---|---|---|
| `.env` | Configuration locale | Contient les secrets et variables (ex: base de donnees). | Quand un secret ou une URL change. | Creer un `.env` local non versionne. |
| `.gitignore` | Configuration Git | Dit a Git quels fichiers ignorer. | Quand tu ajoutes des fichiers generes a ignorer. | Copier le `.gitignore` de base du template. |
| `README.md` | Documentation racine | Point d entree du projet. | Quand commandes ou architecture changent. | Toujours creer un README minimal des le debut. |
| `app/api/documentation/route.ts` | HTTP (adapter) | Porte d entree HTTP: lit requete et renvoie JSON. | Quand un endpoint evolue. | Creer un dossier `app/api/<route>/route.ts`. |
| `app/api/sante/route.ts` | HTTP (adapter) | Porte d entree HTTP: lit requete et renvoie JSON. | Quand un endpoint evolue. | Creer un dossier `app/api/<route>/route.ts`. |
| `app/docs/[slug]/page.tsx` | Support | Fichier de support de la base backend. | Quand besoin lie au fichier apparait. | Reprendre le meme pattern de dossier. |
| `app/docs/_lib/documentation.ts` | Site docs web | Catalogue des documents et fonctions de chargement fichiers docs. | Quand un document est ajoute ou renomme. | Centraliser la table des docs et lecture de fichiers. |
| `app/docs/document.module.css` | Site docs web | Style visuel du site de documentation. | Quand design docs evolue. | Utiliser CSS modules dedies aux pages docs. |
| `app/docs/page.module.css` | Site docs web | Style visuel du site de documentation. | Quand design docs evolue. | Utiliser CSS modules dedies aux pages docs. |
| `app/docs/page.tsx` | Site docs web | Portail web de documentation avec navigation des guides. | Quand UX du site docs evolue. | Creer une page index docs qui liste les documents. |
| `app/documentation/page.tsx` | HTTP Docs UI | Page Swagger UI pour lire/tester l API. | Quand URL docs ou rendu UI change. | Creer une page client avec `swagger-ui-react`. |
| `app/layout.tsx` | App Router | Layout global obligatoire de Next App Router. | Si tu changes la structure globale des pages. | Creer un layout minimal meme pour API-only. |
| `docs/CAPTURES_DOSSIERS_ET_SOUS_DOSSIERS.md` | Documentation | Manuels et references du projet. | Des qu un fichier ou concept evolue. | Conserver docs versionnees dans `/docs`. |
| `docs/CHARTE_DOCUMENTATION_OBLIGATOIRE.md` | Documentation | Manuels et references du projet. | Des qu un fichier ou concept evolue. | Conserver docs versionnees dans `/docs`. |
| `docs/CONCEPTS_BACKEND_POO_SOLID.md` | Documentation | Manuels et references du projet. | Des qu un fichier ou concept evolue. | Conserver docs versionnees dans `/docs`. |
| `docs/DOCUMENTATION_FICHIER_PAR_FICHIER.md` | Documentation | Manuels et references du projet. | Des qu un fichier ou concept evolue. | Conserver docs versionnees dans `/docs`. |
| `docs/GUIDE_DOSSIER_PAR_DOSSIER.md` | Documentation | Manuels et references du projet. | Des qu un fichier ou concept evolue. | Conserver docs versionnees dans `/docs`. |
| `docs/GUIDE_MAITRE_ARCHITECTURE_REUTILISABLE.md` | Documentation | Manuels et references du projet. | Des qu un fichier ou concept evolue. | Conserver docs versionnees dans `/docs`. |
| `docs/INDEX_DOCUMENTATION_COMPLETE.md` | Documentation | Manuels et references du projet. | Des qu un fichier ou concept evolue. | Conserver docs versionnees dans `/docs`. |
| `docs/MODELE_CONFIGURATION_SYSTEME.md` | Documentation | Manuels et references du projet. | Des qu un fichier ou concept evolue. | Conserver docs versionnees dans `/docs`. |
| `docs/REFERENCE_FICHIER_PAR_FICHIER.md` | Documentation | Manuels et references du projet. | Des qu un fichier ou concept evolue. | Conserver docs versionnees dans `/docs`. |
| `docs/SEEDERS_GUIDE_COMPLET.md` | Documentation | Manuels et references du projet. | Des qu un fichier ou concept evolue. | Conserver docs versionnees dans `/docs`. |
| `eslint.config.mjs` | Qualite | Regles de style et de qualite de code. | Quand vous decidez de nouvelles regles lint. | Copier la config ESLint du projet type. |
| `middleware.ts` | Middleware global Next | Point d entree middleware avant toutes les routes API. | Quand pipeline middleware global change. | Creer `middleware.ts` a la racine et brancher une pipeline. |
| `next-env.d.ts` | TypeScript/Next | Typages auto generes par Next.js. | Ne pas modifier manuellement. | Laisse Next le regenerer. |
| `next.config.ts` | Framework Next | Parametres globaux Next.js. | Quand il faut changer le comportement du framework. | Creer un `next.config.ts` avec options minimales. |
| `package-lock.json` | Lock dependances | Verrouille les versions exactes npm. | Automatique apres `npm install`. | Le garder committe pour builds stables. |
| `package.json` | Build & scripts | Declare dependances et commandes npm. | Quand tu ajoutes une lib ou un script. | Initialiser avec create-next-app puis adapter. |
| `prisma/schema.prisma` | Persistance | Modele la base de donnees Prisma. | Quand une table/champ relation metier change. | Copier le schema puis lancer `prisma generate`. |
| `prisma/seed.mjs` | Seeders Prisma | Point d entree des seeders de base de donnees. | Quand sequence globale de seed change. | Creer un script seed principal qui orchestre les seeders. |
| `prisma/seeders/OrchestrateurSeeders.mjs` | Seeders Prisma | Execute tous les seeders dans l ordre. | Quand un nouveau seeder est ajoute. | Avoir un orchestrateur central de seeders. |
| `prisma/seeders/SeederAbstrait.mjs` | Seeders Prisma | Classe parent de seeders avec methode `executer()`. | Quand contrat commun des seeders evolue. | Creer une classe abstraite partagée. |
| `prisma/seeders/SeederConfigurationSysteme.mjs` | Seeders Prisma | Seeder idempotent de `configuration_systeme` (create/update default/ignore custom). | Quand logique de seed configuration change. | Creer un seeder par table/concept metier. |
| `prisma/seeders/donneesConfigurationSysteme.mjs` | Seeders Prisma | Jeu de donnees de base pour la configuration systeme. | Quand valeurs par defaut changent. | Separer les donnees seed dans un fichier dedie. |
| `src/application/dtos/DtoAdmin.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoBrandingAdmin.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoCaution.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoClient.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoConfigurationPlateforme.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoCreationUtilisateur.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoDemandeAdmin.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoDocument.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoEntreprise.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoErreurImport.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoExecutionImport.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoIpBloquee.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoItemTravail.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoJournalAudit.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoLocation.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoNotification.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoPaiementAbonnementAdmin.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoPaiementCaution.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoPaiementMensuel.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoPermissionsAdmin.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoReponseUtilisateur.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoStatutAbonnementAdmin.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoTransactionPaiement.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/DtoUtilisateur.ts` | Application DTO | Objet de transport des donnees entre couches. | Quand l entree/sortie d un cas d usage change. | Creer `DtoXxx.ts` correspondant a chaque besoin. |
| `src/application/dtos/index.ts` | Application DTO | Barrel export de tous les DTO. | Quand un nouveau DTO est ajoute. | Faire un `index.ts` qui re-exporte le dossier. |
| `src/application/exceptions/ExceptionApplication.ts` | Application exceptions | Signale une erreur de cas d usage/validation applicative. | Quand tu veux typer une erreur metier applicative. | Creer une classe `Exception*` qui etend la base. |
| `src/application/exceptions/ExceptionCasUsage.ts` | Application exceptions | Signale une erreur de cas d usage/validation applicative. | Quand tu veux typer une erreur metier applicative. | Creer une classe `Exception*` qui etend la base. |
| `src/application/exceptions/ExceptionValidationApplication.ts` | Application exceptions | Signale une erreur de cas d usage/validation applicative. | Quand tu veux typer une erreur metier applicative. | Creer une classe `Exception*` qui etend la base. |
| `src/application/exceptions/index.ts` | Application exceptions | Barrel export des exceptions applicatives. | Quand une exception applicative est ajoutee. | Centraliser les exports via `index.ts`. |
| `src/application/fabriques/FabriqueUtilisateur.ts` | Application fabrique | Construit une entite valide via builder(s). | Quand la logique de creation metier change. | Creer `FabriqueXxx` pour centraliser la creation. |
| `src/application/mappers/MappeurUtilisateur.ts` | Application mapper | Convertit entite vers DTO (et inverse si besoin). | Quand format API ou entite evolue. | Creer `MappeurXxx` statique. |
| `src/application/services/ServiceSante.ts` | Application service | Orchestre les cas d usage (sans details HTTP). | Quand regles de traitement changent. | Creer `ServiceXxx` injecte par interfaces. |
| `src/application/validateurs/ValidateurUtilisateur.ts` | Application validateur | Definit l intention de validation cote use-case. | Quand contraintes de saisie evoluent. | Creer une classe/contrat de validation metier. |
| `src/coeur/configuration/ConfigurationApplication.ts` | Coeur configuration | Lit et expose la configuration globale de l app. | Quand de nouvelles variables globales sont requises. | Centraliser acces config dans une seule classe. |
| `src/coeur/conteneur/ConteneurDependances.ts` | Coeur DI | Assemble et injecte toutes les dependances. | Quand tu ajoutes un nouveau service/controleur/adaptateur. | Toujours avoir un conteneur unique de cablage. |
| `src/coeur/erreurs/ErreurHttp.ts` | Coeur erreurs | Compatibilite erreur HTTP pour les routes. | Quand format erreur HTTP projet change. | Creer un wrapper autour de l exception HTTP. |
| `src/coeur/exceptions/ExceptionBase.ts` | Coeur exceptions | Base commune des erreurs techniques et HTTP. | Quand vous normalisez la hierarchie erreurs. | Definir une base puis specialiser par type. |
| `src/coeur/exceptions/ExceptionConfiguration.ts` | Coeur exceptions | Base commune des erreurs techniques et HTTP. | Quand vous normalisez la hierarchie erreurs. | Definir une base puis specialiser par type. |
| `src/coeur/exceptions/ExceptionHttp.ts` | Coeur exceptions | Base commune des erreurs techniques et HTTP. | Quand vous normalisez la hierarchie erreurs. | Definir une base puis specialiser par type. |
| `src/coeur/exceptions/ExceptionTechnique.ts` | Coeur exceptions | Base commune des erreurs techniques et HTTP. | Quand vous normalisez la hierarchie erreurs. | Definir une base puis specialiser par type. |
| `src/coeur/exceptions/index.ts` | Coeur exceptions | Barrel export des exceptions coeur. | Quand exception coeur ajoutee. | Exporter toutes les classes via index. |
| `src/coeur/interfaces/InterfaceClientBaseDeDonnees.ts` | Coeur interfaces | Contrats techniques transverses (DIP). | Quand un service a besoin d un nouveau contrat. | Creer une interface minimaliste par besoin. |
| `src/coeur/interfaces/InterfaceValidateurEntree.ts` | Coeur interfaces | Contrats techniques transverses (DIP). | Quand un service a besoin d un nouveau contrat. | Creer une interface minimaliste par besoin. |
| `src/controleurs/ControleurSante.ts` | Controleur | Recoit entree, valide, appelle service. | Quand contrat entree/sortie HTTP change. | Un controleur par groupe de routes. |
| `src/docs/README.ts` | Documentation code | Placeholder pour docs techniques TS internes. | Quand vous implementez docs executees en code. | Laisser fichier balise ou le remplacer par vraie doc. |
| `src/documentation/GenerateurSwagger.ts` | Documentation API | Genere la specification OpenAPI (Swagger). | Quand meta OpenAPI change. | Centraliser generation swagger dans une classe. |
| `src/domaine/builders/BuilderAbstrait.ts` | Domaine builders | Outils communs de validation/construction. | Quand une regle commune de creation change. | Mettre les helpers communs dans un builder parent. |
| `src/domaine/builders/BuilderEntiteAdmin.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteBrandingAdmin.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteCaution.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteClient.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteConfigurationPlateforme.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteDemandeAdmin.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteDocument.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteEntreprise.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteErreurImport.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteExecutionImport.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteIpBloquee.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteItemTravail.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteJournalAudit.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteLocation.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteNotification.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntitePaiementAbonnementAdmin.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntitePaiementCaution.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntitePaiementMensuel.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntitePermissionsAdmin.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteStatutAbonnementAdmin.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteTransactionPaiement.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/BuilderEntiteUtilisateur.ts` | Domaine builders | Construit une entite valide de type donne. | Quand les champs obligatoires/regles de creation changent. | Un builder par entite. |
| `src/domaine/builders/index.ts` | Domaine builders | Barrel export des builders. | Quand un builder est ajoute. | Garder un index unique pour tous builders. |
| `src/domaine/entites/EntiteAdmin.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteBrandingAdmin.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteCaution.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteClient.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteConfigurationPlateforme.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteDemandeAdmin.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteDocument.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteEntreprise.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteErreurImport.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteExecutionImport.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteIpBloquee.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteItemTravail.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteJournalAudit.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteLocation.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteNotification.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntitePaiementAbonnementAdmin.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntitePaiementCaution.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntitePaiementMensuel.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntitePermissionsAdmin.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteStatutAbonnementAdmin.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteTransactionPaiement.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/EntiteUtilisateur.ts` | Domaine entite | Definit l etat et les comportements metier. | Quand la regle metier de l objet change. | Creer une classe metier claire et simple. |
| `src/domaine/entites/ObjetDomaine.ts` | Domaine base objet | Fournit equals/estEgal/toString/toJSON aux entites. | Quand strategie d egalite identite evolue. | Creer une classe de base commune d entites. |
| `src/domaine/entites/index.ts` | Domaine entites | Barrel export des entites. | Quand une entite est ajoutee/supprimee. | Toujours avoir un index d export. |
| `src/domaine/enumerations/EnumerationRoleUtilisateur.ts` | Domaine enums | Liste de valeurs autorisees (roles, etc.). | Quand un nouveau role/etat est ajoute. | Creer enum pour eliminer les strings libres. |
| `src/domaine/exceptions/ExceptionDomaine.ts` | Domaine exceptions | Erreurs de regles metier et invalidites metier. | Quand vous voulez typer une faute metier. | Creer une exception specialisee par famille metier. |
| `src/domaine/exceptions/ExceptionEntiteInvalide.ts` | Domaine exceptions | Erreurs de regles metier et invalidites metier. | Quand vous voulez typer une faute metier. | Creer une exception specialisee par famille metier. |
| `src/domaine/exceptions/ExceptionObjetValeurInvalide.ts` | Domaine exceptions | Erreurs de regles metier et invalidites metier. | Quand vous voulez typer une faute metier. | Creer une exception specialisee par famille metier. |
| `src/domaine/exceptions/ExceptionRegleMetier.ts` | Domaine exceptions | Erreurs de regles metier et invalidites metier. | Quand vous voulez typer une faute metier. | Creer une exception specialisee par famille metier. |
| `src/domaine/exceptions/index.ts` | Domaine exceptions | Barrel export des exceptions domaine. | Quand une exception domaine est ajoutee. | Centraliser exports par couche. |
| `src/domaine/interfaces/InterfaceReferentielUtilisateur.ts` | Domaine interfaces | Contrats metier/referentiels hors DAO generique. | Quand le domaine declare une nouvelle abstraction. | Definir contrats cote domaine uniquement. |
| `src/domaine/interfaces/dao/InterfaceDaoAdmin.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoBrandingAdmin.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoCaution.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoClient.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoConfigurationPlateforme.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoDemandeAdmin.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoDocument.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoEntreprise.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoErreurImport.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoExecutionImport.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoIpBloquee.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoItemTravail.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoJournalAudit.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoLocation.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoNotification.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoPaiementAbonnementAdmin.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoPaiementCaution.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoPaiementMensuel.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoPermissionsAdmin.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoStatutAbonnementAdmin.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoTransactionPaiement.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/InterfaceDaoUtilisateur.ts` | Domaine interfaces DAO | Contrat de persistance pour une entite. | Quand operations CRUD requises evoluent. | Creer `InterfaceDaoXxx` par entite. |
| `src/domaine/interfaces/dao/index.ts` | Domaine interfaces DAO | Barrel export des contrats DAO. | Quand un nouveau contrat DAO est ajoute. | Exporter tous les contrats via index. |
| `src/domaine/objets_valeur/ObjetValeurAdresseIp.ts` | Domaine objets valeur | Encapsule une valeur valide (email, montant, etc.). | Quand une regle de validation metier change. | Un objet valeur par type sensible. |
| `src/domaine/objets_valeur/ObjetValeurCniSenegal.ts` | Domaine objets valeur | Encapsule une valeur valide (email, montant, etc.). | Quand une regle de validation metier change. | Un objet valeur par type sensible. |
| `src/domaine/objets_valeur/ObjetValeurCouleurHexadecimale.ts` | Domaine objets valeur | Encapsule une valeur valide (email, montant, etc.). | Quand une regle de validation metier change. | Un objet valeur par type sensible. |
| `src/domaine/objets_valeur/ObjetValeurEmail.ts` | Domaine objets valeur | Encapsule une valeur valide (email, montant, etc.). | Quand une regle de validation metier change. | Un objet valeur par type sensible. |
| `src/domaine/objets_valeur/ObjetValeurIdentifiant.ts` | Domaine objets valeur | Encapsule une valeur valide (email, montant, etc.). | Quand une regle de validation metier change. | Un objet valeur par type sensible. |
| `src/domaine/objets_valeur/ObjetValeurMoisComptable.ts` | Domaine objets valeur | Encapsule une valeur valide (email, montant, etc.). | Quand une regle de validation metier change. | Un objet valeur par type sensible. |
| `src/domaine/objets_valeur/ObjetValeurMontant.ts` | Domaine objets valeur | Encapsule une valeur valide (email, montant, etc.). | Quand une regle de validation metier change. | Un objet valeur par type sensible. |
| `src/domaine/objets_valeur/ObjetValeurNumeroRecu.ts` | Domaine objets valeur | Encapsule une valeur valide (email, montant, etc.). | Quand une regle de validation metier change. | Un objet valeur par type sensible. |
| `src/domaine/objets_valeur/ObjetValeurTelephoneSenegal.ts` | Domaine objets valeur | Encapsule une valeur valide (email, montant, etc.). | Quand une regle de validation metier change. | Un objet valeur par type sensible. |
| `src/domaine/objets_valeur/ObjetValeurTexteNonVide.ts` | Domaine objets valeur | Encapsule une valeur valide (email, montant, etc.). | Quand une regle de validation metier change. | Un objet valeur par type sensible. |
| `src/domaine/objets_valeur/ObjetValeurUrlHttpOuChemin.ts` | Domaine objets valeur | Encapsule une valeur valide (email, montant, etc.). | Quand une regle de validation metier change. | Un objet valeur par type sensible. |
| `src/domaine/objets_valeur/index.ts` | Domaine objets valeur | Barrel export des objets valeur. | Quand objet valeur ajoute. | Centraliser exports objets valeur. |
| `src/domaine/types/TypeBien.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypeDocument.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypeLigneImportee.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypeMethodePaiementAbonnement.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypeModeAbonnementAdmin.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypePrioriteTravail.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypeStatutAdmin.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypeStatutClient.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypeStatutPaiementAbonnement.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypeStatutPaiementMensuel.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypeStatutTravail.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypeStatutUtilisateur.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/TypesConfigurationNotifications.ts` | Domaine types | Types metier stricts (statuts, modes, structures). | Quand schema metier de type evolue. | Un fichier type par concept metier. |
| `src/domaine/types/index.ts` | Domaine types | Barrel export des types metier. | Quand type ajoute/supprime. | Centraliser tous les types dans ce dossier. |
| `src/infrastructure/base_de_donnees/AdaptateurPrisma.ts` | Infrastructure DB | Implementation concrete du contrat acces BD. | Quand les tests/requetes techniques changent. | Creer adaptateur qui implemente interface coeur. |
| `src/infrastructure/base_de_donnees/ClientPrisma.ts` | Infrastructure DB | Fournit/centralise le client Prisma. | Quand strategie connexion Prisma change. | Isoler la creation du client DB. |
| `src/infrastructure/dao/index.ts` | Infrastructure DAO | Exports centralises des DAO concrets. | Quand DAO concret ajoute. | Toujours fournir des index d export. |
| `src/infrastructure/dao/memoire/DaoAdminMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoBrandingAdminMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoCautionMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoClientMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoConfigurationPlateformeMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoDemandeAdminMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoDocumentMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoEntrepriseMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoErreurImportMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoExecutionImportMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoIpBloqueeMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoItemTravailMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoJournalAuditMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoLocationMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoNotificationMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoPaiementAbonnementAdminMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoPaiementCautionMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoPaiementMensuelMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoPermissionsAdminMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoStatutAbonnementAdminMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoTransactionPaiementMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/DaoUtilisateurMemoire.ts` | Infrastructure DAO memoire | Implementation en memoire du contrat DAO. | Tests, prototypage, mode sans base reelle. | Map interne + CRUD asynchrone. |
| `src/infrastructure/dao/memoire/index.ts` | Infrastructure DAO | Exports centralises des DAO concrets. | Quand DAO concret ajoute. | Toujours fournir des index d export. |
| `src/infrastructure/exceptions/ExceptionAccesDonnees.ts` | Infrastructure exceptions | Erreurs techniques de persistance/dependances externes. | Quand une faute technique doit etre typable. | Specialiser depuis `ExceptionInfrastructure`. |
| `src/infrastructure/exceptions/ExceptionDependanceExterne.ts` | Infrastructure exceptions | Erreurs techniques de persistance/dependances externes. | Quand une faute technique doit etre typable. | Specialiser depuis `ExceptionInfrastructure`. |
| `src/infrastructure/exceptions/ExceptionInfrastructure.ts` | Infrastructure exceptions | Erreurs techniques de persistance/dependances externes. | Quand une faute technique doit etre typable. | Specialiser depuis `ExceptionInfrastructure`. |
| `src/infrastructure/exceptions/index.ts` | Infrastructure exceptions | Barrel export des exceptions infrastructure. | Quand exception infra ajoutee. | Centraliser exports exceptions infra. |
| `src/infrastructure/middlewares/InterfaceMiddlewareHttp.ts` | Infrastructure middlewares | Contrat standard de middleware HTTP. | Quand signature middleware projet evolue. | Definir une interface middleware unique. |
| `src/infrastructure/middlewares/MiddlewareJournalisation.ts` | Infrastructure middlewares | Middleware technique unitaire (log, maintenance...). | Quand une regle globale avant route change. | Un fichier middleware par responsabilite. |
| `src/infrastructure/middlewares/MiddlewareMaintenance.ts` | Infrastructure middlewares | Middleware technique unitaire (log, maintenance...). | Quand une regle globale avant route change. | Un fichier middleware par responsabilite. |
| `src/infrastructure/middlewares/PipelineMiddlewaresHttp.ts` | Infrastructure middlewares | Execute les middlewares dans l ordre. | Quand sequence middleware change. | Creer une pipeline chainee avec arret sur reponse. |
| `src/infrastructure/middlewares/index.ts` | Infrastructure middlewares | Barrel export des middlewares techniques. | Quand middleware ajoute/supprime. | Centraliser exports middlewares. |
| `src/infrastructure/utils/UtilitaireDate.ts` | Infrastructure utils | Utilitaires techniques partages. | Quand logique utilitaire commune apparait. | Isoler utilitaires purs par responsabilite. |
| `src/infrastructure/utils/UtilitaireIdentifiant.ts` | Infrastructure utils | Utilitaires techniques partages. | Quand logique utilitaire commune apparait. | Isoler utilitaires purs par responsabilite. |
| `src/infrastructure/validateurs/ValidateurZod.ts` | Infrastructure validation | Validation technique concrete via Zod. | Quand schema d entree API change. | Creer validateur adaptant Zod vers interface. |
| `src/messages/anglais/validation.auth.ts` | Messages EN | Traductions anglaises de validation. | Quand message EN change. | Conserver meme cles que FR. |
| `src/messages/anglais/validation.client.ts` | Messages EN | Traductions anglaises de validation. | Quand message EN change. | Conserver meme cles que FR. |
| `src/messages/anglais/validation.common.ts` | Messages EN | Traductions anglaises de validation. | Quand message EN change. | Conserver meme cles que FR. |
| `src/messages/anglais/validation.payment.ts` | Messages EN | Traductions anglaises de validation. | Quand message EN change. | Conserver meme cles que FR. |
| `src/messages/anglais/validation.property.ts` | Messages EN | Traductions anglaises de validation. | Quand message EN change. | Conserver meme cles que FR. |
| `src/messages/anglais/validation.ts` | Messages EN | Traductions anglaises de validation. | Quand message EN change. | Conserver meme cles que FR. |
| `src/messages/app.ts` | Messages aggregation | Assemble dictionnaires FR/EN + helpers `t`. | Quand mode de traduction ou sources changent. | Creer un assembleur unique des messages. |
| `src/messages/app/actions.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/app/confirmations.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/app/entities.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/app/errors.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/app/index.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/app/labels.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/app/menu.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/app/nav.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/app/pages.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/app/status.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/app/success.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/app/validation.ts` | Messages app | Bibliotheque de cles metier (actions, status, errors...). | Quand un texte metier est ajoute/modifie. | Un fichier par famille de messages. |
| `src/messages/franchais/validation.auth.ts` | Messages FR | Traductions francaises de validation. | Quand message FR change. | Conserver meme cles que EN. |
| `src/messages/franchais/validation.client.ts` | Messages FR | Traductions francaises de validation. | Quand message FR change. | Conserver meme cles que EN. |
| `src/messages/franchais/validation.common.ts` | Messages FR | Traductions francaises de validation. | Quand message FR change. | Conserver meme cles que EN. |
| `src/messages/franchais/validation.payment.ts` | Messages FR | Traductions francaises de validation. | Quand message FR change. | Conserver meme cles que EN. |
| `src/messages/franchais/validation.property.ts` | Messages FR | Traductions francaises de validation. | Quand message FR change. | Conserver meme cles que EN. |
| `src/messages/franchais/validation.ts` | Messages FR | Traductions francaises de validation. | Quand message FR change. | Conserver meme cles que EN. |
| `src/messages/index.ts` | Messages facade | Point d entree unique de tous les messages. | Quand nouvel aggregateur ou export global. | Toujours forcer import unique via facade. |
| `src/messages/validation-keys.ts` | Messages validation | Declare les cles de validation partagees. | Quand nouvelle regle de validation est ajoutee. | Centraliser les constantes de cles. |
| `src/messages/validation.ts` | Messages validation | Assemble les messages de validation FR/EN. | Quand cles de validation evoluent. | Un point d acces unique pour validation. |
| `src/tests/README.ts` | Tests | Balise de dossier tests (placeholder). | Quand vous ajoutez les vrais tests. | Remplacer par suites unitaires/integration. |
| `tsconfig.json` | Compilation TS | Regles TypeScript et alias de chemins. | Quand il faut ajuster strict mode ou alias. | Copier puis garder `strict: true`. |
