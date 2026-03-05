# Diagrammes Classes Admin SuperAdmin Client

Ce document formalise la representation orientee objet actuelle du backend.

Point cle de conception:
- Il n'existe pas de classe `SuperAdmin` separee.
- `SUPER_ADMIN` est une valeur de role portee par `EntiteUtilisateur.role`.
- `Admin` est une entite metier specifique (`EntiteAdmin`) liee a un utilisateur.

## 1) Diagramme classes Admin + SuperAdmin (auth + administration)

```mermaid
classDiagram
direction LR

class EnumerationRoleUtilisateur {
  <<enumeration>>
  SUPER_ADMIN
  ADMIN
  UTILISATEUR
}

class TypeStatutUtilisateur {
  <<type>>
  ACTIF
  SUSPENDU
  ARCHIVE
}

class EntiteUtilisateur {
  +string id
  +string identifiantConnexion
  +string nomComplet
  +string email
  +EnumerationRoleUtilisateur role
  +TypeStatutUtilisateur statut
  +string motDePasseHash
  +string? telephone
  +Date creeLe
  +estActif() bool
  +estSuperAdmin() bool
  +desactiver() void
}

class TypeStatutAdmin {
  <<type>>
  EN_ATTENTE
  ACTIF
  SUSPENDU
  BLACKLISTE
  ARCHIVE
}

class TypeModeAbonnementAdmin {
  <<type>>
  monthly
  premium
  annual
}

class EntitePermissionsAdmin {
  +bool tableauDeBord
  +bool clients
  +bool locations
  +bool paiements
  +bool documents
  +bool parametres
  +bool travaux
  +bool imports
  +bool notifications
  +bool exportPdf
  +nombrePermissionsActives() number
}

class EntiteAdmin {
  +string id
  +string utilisateurId
  +string nomUtilisateur
  +string nom
  +string email
  +TypeStatutAdmin statut
  +string? entrepriseId
  +TypeModeAbonnementAdmin modeAbonnement
  +number montantMensuelAbonnement
  +number montantAnnuelAbonnement
  +bool autoriserMontantPersonnalise
  +EntitePermissionsAdmin permissions
  +Date creeLe
  +estActif() bool
  +peutAcceder(fonctionnalite) bool
}

class EntiteEntreprise {
  +string id
  +string nom
  +string? adminId
  +Date creeLe
}

class EntiteDemandeAdmin {
  +string id
  +string nom
  +string? email
  +string? telephone
  +string? nomEntreprise
  +TypeStatutAdmin statut
  +string? nomUtilisateur
  +string? motDePasse
  +bool paye
  +Date? payeLe
  +Date creeLe
  +marquerCommePayee() void
}

class EntitePaiementAbonnementAdmin {
  +string id
  +string adminId
  +number montant
  +string methode
  +string mois
  +string? entrepriseId
  +string statut
  +Date? payeLe
  +TypeModeAbonnementAdmin modeAbonnement
  +Date creeLe
}

class EntiteStatutAbonnementAdmin {
  +string adminId
  +bool bloque
  +string? moisEnRetard
  +Date? echeance
  +string moisRequis
  +string moisCourant
  +number joursGrace
  +TypeModeAbonnementAdmin modeAbonnement
  +number? montantAttendu
  +bool autoriserMontantLibre
  +estEnRetard() bool
  +doitEtreBloque() bool
}

class EntiteBrandingAdmin {
  +string adminId
  +string nomApplication
  +string urlLogo
  +string[] bibliothequeLogos
  +string couleurPrincipale
  +string textePiedPage
  +definirLogo(url) void
}

class EntitePermissionUtilisateurAuth {
  +string code
  +bool autorise
}

class EntiteUtilisateurAuthentification {
  +string id
  +string telephone
  +string email
  +string motDePasseHache
  +string role
  +string statut
  +bool superAdminTotpActive
  +string? superAdminTotpSecret
  +EntitePermissionUtilisateurAuth[] permissions
  +estActif() bool
  +estSuperAdmin() bool
}

class EntiteSessionAuthentification {
  +string id
  +string jetonAccesJti
  +Date jetonAccesExpireLe
  +string csrfToken
  +string adresseIp
  +string agentUtilisateur
  +Date? secondeAuthValideeLe
  +Date expireLe
  +Date? revoqueeLe
  +Date? compromissionDetecteeLe
  +estRevoqueeOuCompromise() bool
  +estExpiree() bool
}

class EntiteJetonRefresh {
  +string id
  +string sessionId
  +string hachageToken
  +Date expireLe
  +Date? utiliseLe
  +Date? revoqueLe
  +string? remplaceParId
  +estUtiliseOuRevoque() bool
  +estExpire() bool
}

EntiteUtilisateur --> EnumerationRoleUtilisateur : role
EntiteUtilisateur --> TypeStatutUtilisateur : statut
EntiteAdmin --> TypeStatutAdmin : statut
EntiteAdmin --> TypeModeAbonnementAdmin : modeAbonnement
EntiteStatutAbonnementAdmin --> TypeModeAbonnementAdmin : modeAbonnement

EntiteUtilisateur "1" --> "0..1" EntiteAdmin : utilisateurId
EntiteAdmin "1" *-- "1" EntitePermissionsAdmin : permissions
EntiteAdmin "0..*" --> "0..1" EntiteEntreprise : entrepriseId
EntiteEntreprise "0..1" --> "1" EntiteAdmin : adminId
EntiteDemandeAdmin ..> EntiteAdmin : validation -> creation

EntiteAdmin "1" --> "0..*" EntitePaiementAbonnementAdmin : adminId
EntiteAdmin "1" --> "1" EntiteStatutAbonnementAdmin : adminId
EntiteAdmin "1" --> "0..1" EntiteBrandingAdmin : adminId

EntiteUtilisateurAuthentification "1" *-- "0..*" EntitePermissionUtilisateurAuth : permissions
EntiteSessionAuthentification "*" --> "1" EntiteUtilisateurAuthentification : utilisateur
EntiteJetonRefresh "*" --> "1" EntiteSessionAuthentification : session
```

Lecture conception:
- `SUPER_ADMIN` est un role sur `EntiteUtilisateur`.
- L'entite `EntiteAdmin` encapsule les besoins metier admin (abonnement, permissions metier, branding, paiements).
- Le sous-modele authentification est separe (`EntiteUtilisateurAuthentification`, `EntiteSessionAuthentification`, `EntiteJetonRefresh`) pour isoler la securite.

## 2) Diagramme classes Client (locations/paiements/documents)

```mermaid
classDiagram
direction LR

class TypeStatutClient {
  <<type>>
  active
  archived
  blacklisted
}

class TypeBien {
  <<type>>
  studio
  room
  apartment
  villa
  other
}

class TypeDocument {
  <<type>>
  contract
  receipt
  other
}

class TypeStatutPaiementMensuel {
  <<type>>
  paid
  partial
  unpaid
  late
}

class EntiteClient {
  +string id
  +string prenom
  +string nom
  +string telephone
  +string cni
  +string? adminId
  +string? email
  +TypeStatutClient statut
  +Date creeLe
  +EntiteLocation[] locations
  +nomComplet() string
  +ajouterLocation(location) void
  +aDesLocations() bool
}

class EntiteLocation {
  +string id
  +string clientId
  +TypeBien typeBien
  +string nomBien
  +number loyerMensuel
  +Date dateDebut
  +EntiteCaution caution
  +EntitePaiementMensuel[] paiementsMensuels
  +EntiteDocument[] documents
  +aBienRenseigne() bool
  +ajouterDocument(document) void
  +ajouterPaiementMensuel(paiement) void
}

class EntiteCaution {
  +number montantTotal
  +number montantPaye
  +EntitePaiementCaution[] paiements
  +montantRestant() number
  +estSoldee() bool
  +ajouterPaiement(paiement) void
}

class EntitePaiementCaution {
  +string id
  +number montant
  +Date datePaiement
  +string numeroRecu
  +string? note
  +estValide() bool
}

class EntitePaiementMensuel {
  +string id
  +string locationId
  +Date periodeDebut
  +Date periodeFin
  +Date dateEcheance
  +number montantDu
  +number montantPaye
  +TypeStatutPaiementMensuel statut
  +EntiteTransactionPaiement[] transactions
  +montantRestant() number
  +estSolde() bool
  +estEnRetard() bool
  +ajouterTransaction(transaction) void
}

class EntiteTransactionPaiement {
  +string id
  +number montant
  +Date datePaiement
  +string numeroRecu
  +string? description
  +estValide() bool
}

class EntiteDocument {
  +string id
  +string nom
  +TypeDocument type
  +string url
  +Date dateAjout
  +bool estSigne
  +marquerCommeSigne() void
}

EntiteClient --> TypeStatutClient : statut
EntiteLocation --> TypeBien : typeBien
EntiteDocument --> TypeDocument : type
EntitePaiementMensuel --> TypeStatutPaiementMensuel : statut

EntiteClient "1" *-- "0..*" EntiteLocation : locations
EntiteLocation "1" *-- "1" EntiteCaution : caution
EntiteCaution "1" *-- "0..*" EntitePaiementCaution : paiements
EntiteLocation "1" *-- "0..*" EntitePaiementMensuel : paiementsMensuels
EntitePaiementMensuel "1" *-- "0..*" EntiteTransactionPaiement : transactions
EntiteLocation "1" *-- "0..*" EntiteDocument : documents
```

Lecture conception:
- Oui, le client a son propre diagramme de classes.
- `EntiteClient` est l'agregat principal cote location.
- Une location regroupe 3 sous-domaines: caution, paiements mensuels, documents.
