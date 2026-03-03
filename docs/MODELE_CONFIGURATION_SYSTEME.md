# Modele Base de Donnees: Configuration Systeme

Ce document decrit la nouvelle table de configuration recommandee.

## 1. Objectif

Avoir une configuration:
- typée (string, number, boolean)
- multi-portee (globale et par admin)
- securisee (verrouillage)
- evolutive

## 2. Schema Prisma

Fichier source:
- `prisma/schema.prisma`

Modele:

```prisma
model ConfigurationSysteme {
  id         String                    @id @default(cuid())
  cle        String
  valeurTexte String?
  valeurNombre Float?
  valeurBooleen Boolean?
  typeValeur TypeValeurConfiguration
  portee     TypePorteeConfiguration   @default(GLOBAL)
  adminId    String?
  scopeCle   String                    @default("GLOBAL")
  origine    TypeOrigineConfiguration  @default(DEFAULT)
  verrouille Boolean                   @default(false)
  creeLe     DateTime                  @default(now())
  misAJourLe DateTime                  @updatedAt

  @@unique([cle, scopeCle])
  @@index([portee, adminId])
  @@map("configuration_systeme")
}
```

Enums:

```prisma
enum TypeValeurConfiguration {
  STRING
  NUMBER
  BOOLEAN
}

enum TypePorteeConfiguration {
  GLOBAL
  ADMIN
}

enum TypeOrigineConfiguration {
  DEFAULT
  CUSTOM
}
```

## 3. Sens des colonnes

- `cle`: nom logique de la config (`application.nom`, `maintenance.active`, etc.)
- `valeurTexte`: valeur texte (si type `STRING`)
- `valeurNombre`: valeur numerique (si type `NUMBER`)
- `valeurBooleen`: valeur booleenne (si type `BOOLEAN`)
- `typeValeur`: type attendu de la valeur
- `portee`: `GLOBAL` ou `ADMIN`
- `adminId`: identifiant admin si portee admin
- `scopeCle`: cle de scope technique (`GLOBAL` ou identifiant admin)
- `origine`: `DEFAULT` (seed/systeme) ou `CUSTOM` (modifie par utilisateur)
- `verrouille`: si `true`, la config ne doit pas etre ecrasee automatiquement

## 4. Regle d'unicite

La paire unique est:
- `cle + scopeCle`

Exemples:
- `application.nom + GLOBAL` (config globale)
- `application.nom + admin-123` (override pour un admin)

## 5. Exemples de lignes

Global:
- `cle=maintenance.active`, `valeurBooleen=false`, `typeValeur=BOOLEAN`, `scopeCle=GLOBAL`

Admin:
- `cle=application.nom`, `valeurTexte="Papa ODC"`, `typeValeur=STRING`, `portee=ADMIN`, `adminId=admin-123`, `scopeCle=admin-123`

## 6. Comportement seeder

Le seeder fait:
- creation si absent
- mise a jour seulement si `origine=DEFAULT` et `verrouille=false`
- ignore les configurations `CUSTOM` ou `verrouille=true`

But:
- ne pas ecraser les personnalisations utilisateur en production

## 7. Commandes

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```
