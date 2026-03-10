import { randomUUID } from 'node:crypto'
import {
  BuilderEntiteAdmin,
  BuilderEntiteDemandeAdmin,
  BuilderEntiteEntreprise,
  BuilderEntitePermissionsAdmin,
  BuilderEntiteUtilisateur,
} from '@/src/domaine/builders'
import {
  EntiteAdmin,
  EntiteDemandeAdmin,
  EntiteEntreprise,
} from '@/src/domaine/entites/administration'
import { EntiteUtilisateur } from '@/src/domaine/entites/utilisateurs/EntiteUtilisateur'
import { EnumerationRoleUtilisateur } from '@/src/domaine/enumerations/EnumerationRoleUtilisateur'
import { TypeModeAbonnementAdmin, TypeStatutAdmin } from '@/src/domaine/types/administration'
import { TypeStatutUtilisateur } from '@/src/domaine/types/utilisateurs/TypeStatutUtilisateur'
import { ServiceAdministrationAdminUtilitaires } from '@/src/application/services/administration/commun/ServiceAdministrationAdminUtilitaires'
export class ServiceAdministrationAdminConstructeursSupervision {
  public construireEntiteAdminDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteAdmin {
    const id = String(idForce || corps.id || randomUUID())
    const utilisateurId = String(corps.userId || corps.utilisateurId || id)
    const nomUtilisateur = String(corps.username || corps.nomUtilisateur || utilisateurId)
    const nom = String(corps.name || corps.nom || nomUtilisateur)
    const email =
      ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.email) ||
      `${nomUtilisateur}@kya.local`
    const entrepriseId = ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.entrepriseId)
    const builder = new BuilderEntiteAdmin()
      .avecId(id)
      .avecUtilisateurId(utilisateurId)
      .avecNomUtilisateur(nomUtilisateur)
      .avecNom(nom)
      .avecEmail(email)
      .avecStatut(this.normaliserStatutAdmin(corps.status || corps.statut))
      .avecModeAbonnement(
        this.normaliserModeAbonnement(corps.subscriptionMode || corps.modeAbonnement)
      )
      .avecMontantMensuelAbonnement(
        ServiceAdministrationAdminUtilitaires.versNombre(
          corps.subscriptionMonthlyAmount || corps.montantMensuelAbonnement
        )
      )
      .avecMontantAnnuelAbonnement(
        ServiceAdministrationAdminUtilitaires.versNombre(
          corps.subscriptionAnnualAmount || corps.montantAnnuelAbonnement
        )
      )
      .avecAutoriserMontantPersonnalise(
        Boolean(corps.subscriptionAllowCustomAmount ?? corps.autoriserMontantPersonnalise)
      )
      .avecNotifierClientsRetard(Boolean(corps.notifyClientsOverdue))
      .avecNotifierAdminRetard(Boolean(corps.notifyAdminOverdue))
      .avecPermissions(this.construirePermissions(corps.permissions))
      .avecDateCreation(
        ServiceAdministrationAdminUtilitaires.versDate(corps.createdAt || corps.creeLe)
      )

    if (entrepriseId) builder.avecEntrepriseId(entrepriseId)
    return builder.construire()
  }
  public construireEntiteDemandeAdminDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteDemandeAdmin {
    const builder = new BuilderEntiteDemandeAdmin()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecNom(String(corps.name || corps.nom || 'Demande admin'))
      .avecStatut(this.normaliserStatutAdmin(corps.status || corps.statut))
      .avecPaye(Boolean(corps.paid ?? corps.paye))
      .avecDateCreation(
        ServiceAdministrationAdminUtilitaires.versDate(corps.createdAt || corps.creeLe)
      )

    const email = ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.email)
    const telephone = ServiceAdministrationAdminUtilitaires.versTexteOptionnel(
      corps.phone || corps.telephone
    )
    const nomEntreprise = ServiceAdministrationAdminUtilitaires.versTexteOptionnel(
      corps.entrepriseName || corps.nomEntreprise
    )
    const nomUtilisateur = ServiceAdministrationAdminUtilitaires.versTexteOptionnel(
      corps.username || corps.nomUtilisateur
    )
    const motDePasse = ServiceAdministrationAdminUtilitaires.versTexteOptionnel(
      corps.password || corps.motDePasse
    )
    const payeLe = ServiceAdministrationAdminUtilitaires.versDateOptionnelle(
      corps.paidAt || corps.payeLe
    )

    if (email) builder.avecEmail(email)
    if (telephone) builder.avecTelephone(telephone)
    if (nomEntreprise) builder.avecNomEntreprise(nomEntreprise)
    if (nomUtilisateur) builder.avecNomUtilisateur(nomUtilisateur)
    if (motDePasse) builder.avecMotDePasse(motDePasse)
    if (payeLe) builder.avecDatePaiement(payeLe)
    return builder.construire()
  }
  public construireEntiteEntrepriseDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteEntreprise {
    const builder = new BuilderEntiteEntreprise()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecNom(String(corps.name || corps.nom || 'Entreprise'))
      .avecDateCreation(
        ServiceAdministrationAdminUtilitaires.versDate(corps.createdAt || corps.creeLe)
      )

    const adminId = ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.adminId)
    if (adminId) builder.avecAdminId(adminId)
    return builder.construire()
  }
  public construireEntiteUtilisateurDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteUtilisateur {
    const id = String(idForce || corps.id || randomUUID())
    const identifiantConnexion = String(
      corps.username ||
      corps.identifiantConnexion ||
      corps.phone ||
      corps.telephone ||
      corps.email ||
      id
    )
    const nomComplet = String(corps.name || corps.nomComplet || identifiantConnexion)
    const email =
      ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.email) ||
      `${identifiantConnexion}@kya.local`
    const motDePasseHash = String(
      corps.password ||
      corps.motDePasse ||
      corps.motDePasseHash ||
      'password'
    )
    const telephone = ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.phone || corps.telephone)
    const builder = new BuilderEntiteUtilisateur()
      .avecId(id)
      .avecIdentifiantConnexion(identifiantConnexion)
      .avecNomComplet(nomComplet)
      .avecEmail(email)
      .avecRole(this.normaliserRoleUtilisateur(corps.role))
      .avecStatut(this.normaliserStatutUtilisateur(corps.status || corps.statut))
      .avecMotDePasseHash(motDePasseHash)
      .avecDateCreation(
        ServiceAdministrationAdminUtilitaires.versDate(corps.createdAt || corps.creeLe)
      )

    if (telephone) builder.avecTelephone(telephone)
    return builder.construire()
  }
  private normaliserStatutAdmin(valeur: unknown): TypeStatutAdmin {
    const statut = String(valeur || 'EN_ATTENTE').toUpperCase()
    if (
      statut === 'EN_ATTENTE' ||
      statut === 'ACTIF' ||
      statut === 'SUSPENDU' ||
      statut === 'BLACKLISTE' ||
      statut === 'ARCHIVE'
    ) {
      return statut
    }
    return 'EN_ATTENTE'
  }

  private normaliserModeAbonnement(valeur: unknown): TypeModeAbonnementAdmin {
    const mode = String(valeur || 'monthly').toLowerCase()
    if (mode === 'monthly' || mode === 'premium' || mode === 'annual') {
      return mode
    }
    return 'monthly'
  }

  private normaliserRoleUtilisateur(valeur: unknown): EnumerationRoleUtilisateur {
    const role = String(valeur || EnumerationRoleUtilisateur.UTILISATEUR).toUpperCase()
    if (role === EnumerationRoleUtilisateur.SUPER_ADMIN) return EnumerationRoleUtilisateur.SUPER_ADMIN
    if (role === EnumerationRoleUtilisateur.ADMIN) return EnumerationRoleUtilisateur.ADMIN
    return EnumerationRoleUtilisateur.UTILISATEUR
  }

  private normaliserStatutUtilisateur(valeur: unknown): TypeStatutUtilisateur {
    const statut = String(valeur || 'ACTIF').toUpperCase()
    if (statut === 'ACTIF' || statut === 'SUSPENDU' || statut === 'ARCHIVE') {
      return statut
    }
    return 'ACTIF'
  }

  private construirePermissions(valeur: unknown) {
    const brut = ServiceAdministrationAdminUtilitaires.versObjet(valeur)
    return new BuilderEntitePermissionsAdmin()
      .avecTableauDeBord(Boolean(brut.dashboard ?? brut.tableauDeBord ?? true))
      .avecClients(Boolean(brut.clients ?? true))
      .avecLocations(Boolean(brut.rentals ?? brut.locations ?? true))
      .avecPaiements(Boolean(brut.payments ?? brut.paiements ?? true))
      .avecDocuments(Boolean(brut.documents ?? true))
      .avecParametres(Boolean(brut.settings ?? brut.parametres ?? true))
      .avecTravaux(Boolean(brut.work ?? brut.travaux ?? true))
      .avecImports(Boolean(brut.imports ?? true))
      .avecNotifications(Boolean(brut.notifications ?? true))
      .avecExportPdf(Boolean(brut.pdfExport ?? brut.exportPdf ?? true))
      .construire()
  }
}
