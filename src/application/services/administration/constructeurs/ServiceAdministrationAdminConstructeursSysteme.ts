import { randomUUID } from 'node:crypto'
import {
  BuilderEntiteErreurImport,
  BuilderEntiteExecutionImport,
  BuilderEntiteIpBloquee,
  BuilderEntiteItemTravail,
  BuilderEntiteJournalAudit,
  BuilderEntiteNotification,
  BuilderEntitePaiementAbonnementAdmin,
  BuilderEntiteStatutAbonnementAdmin,
} from '@/src/domaine/builders'
import {
  EntiteExecutionImport,
  EntiteIpBloquee,
  EntiteItemTravail,
  EntiteJournalAudit,
  EntiteNotification,
  EntitePaiementAbonnementAdmin,
} from '@/src/domaine/entites'
import {
  InterfaceDaoStatutAbonnementAdmin,
} from '@/src/domaine/interfaces/dao'
import { TypeStatutMouvement } from '@/src/domaine/types/administration'
import { ServiceAdministrationAdminUtilitaires } from '@/src/application/services/administration/commun/ServiceAdministrationAdminUtilitaires'
export class ServiceAdministrationAdminConstructeursSysteme {
  public construireEntiteTravailDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteItemTravail {
    const builder = new BuilderEntiteItemTravail()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecTitre(String(corps.title || corps.titre || 'Travail'))
      .avecDescription(String(corps.description || ''))
      .avecPriorite(this.normaliserPriorite(corps.priority || corps.priorite))
      .avecStatut(this.normaliserStatutTravail(corps.status || corps.statut))
      .avecDateCreation(ServiceAdministrationAdminUtilitaires.versDate(corps.createdAt || corps.creeLe))
      .avecDetecteAutomatiquement(
        Boolean(corps.detectedAutomatically || corps.detecteAutomatiquement)
      )
    const dateEcheance = ServiceAdministrationAdminUtilitaires.versDateOptionnelle(
      corps.dueDate || corps.dateEcheance
    )
    if (dateEcheance) {
      builder.avecDateEcheance(dateEcheance)
    }
    return builder.construire()
  }
  public construireEntiteImportDepuisCorps(
    corps: Record<string, unknown>,
    adminId: string,
    idForce?: string
  ): EntiteExecutionImport {
    const erreurs = Array.isArray(corps.errors)
      ? corps.errors.map((erreur) =>
          new BuilderEntiteErreurImport()
            .avecNumeroLigne(
              ServiceAdministrationAdminUtilitaires.versNombreEntier(
                ServiceAdministrationAdminUtilitaires.versObjet(erreur).rowNumber,
                1
              )
            )
            .avecErreurs(
              Array.isArray(ServiceAdministrationAdminUtilitaires.versObjet(erreur).errors)
                ? (ServiceAdministrationAdminUtilitaires.versObjet(erreur).errors as string[])
                : []
            )
            .avecDonneesBrutes(
              ServiceAdministrationAdminUtilitaires.versObjet(
                ServiceAdministrationAdminUtilitaires.versObjet(erreur).parsed
              )
            )
            .construire()
        )
      : []
    const inserted = Array.isArray(corps.inserted)
      ? corps.inserted.map((ligne) => {
          const objet = ServiceAdministrationAdminUtilitaires.versObjet(ligne)
          return {
            id: String(objet.id || randomUUID()),
            prenom: String(objet.firstName || objet.prenom || ''),
            nom: String(objet.lastName || objet.nom || ''),
            telephone: String(objet.phone || objet.telephone || ''),
            email: ServiceAdministrationAdminUtilitaires.versTexteOptionnel(objet.email),
          }
        })
      : []
    return new BuilderEntiteExecutionImport()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecAdminId(String(corps.adminId || adminId))
      .avecNomFichier(String(corps.fileName || corps.nomFichier || 'import.xlsx'))
      .avecNombreLignesTotal(
        ServiceAdministrationAdminUtilitaires.versNombreEntier(
          corps.totalRows || corps.nombreLignesTotal,
          0
        )
      )
      .avecLignesInserees(inserted)
      .avecErreurs(erreurs)
      .avecIgnoree(Boolean(corps.ignored || corps.ignoree))
      .avecLectureReussie(Boolean(corps.readSuccess ?? corps.lectureReussie ?? true))
      .avecLectureAvecErreurs(Boolean(corps.readErrors ?? corps.lectureAvecErreurs ?? false))
      .avecDateCreation(ServiceAdministrationAdminUtilitaires.versDate(corps.createdAt || corps.creeLe))
      .avecDateMiseAJour(ServiceAdministrationAdminUtilitaires.versDate(corps.updatedAt || corps.misAJourLe))
      .construire()
  }
  public construireEntitePaiementAdminDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntitePaiementAbonnementAdmin {
    return new BuilderEntitePaiementAbonnementAdmin()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecAdminId(String(corps.adminId || ''))
      .avecEntrepriseId(ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.entrepriseId) || '')
      .avecMontant(ServiceAdministrationAdminUtilitaires.versNombre(corps.amount || corps.montant))
      .avecMethode(this.normaliserMethodePaiementAdmin(corps.method || corps.methode))
      .avecMois(String(corps.month || corps.mois || ServiceAdministrationAdminUtilitaires.moisCourant()))
      .avecStatut(this.normaliserStatutPaiementAdmin(corps.status || corps.statut))
      .avecFournisseur(this.normaliserFournisseurPaiement(corps.provider || corps.fournisseur))
      .avecReferenceFournisseur(
        ServiceAdministrationAdminUtilitaires.versTexteOptionnel(
          corps.providerReference || corps.referenceFournisseur
        ) || ''
      )
      .avecUrlPaiement(
        ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.checkoutUrl || corps.urlPaiement) || ''
      )
      .avecTelephonePayeur(
        ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.payerPhone || corps.telephonePayeur) || ''
      )
      .avecReferenceTransaction(
        ServiceAdministrationAdminUtilitaires.versTexteOptionnel(
          corps.transactionRef || corps.referenceTransaction
        ) || ''
      )
      .avecNote(ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.note) || '')
      .avecPayeLe(ServiceAdministrationAdminUtilitaires.versDateOptionnelle(corps.paidAt || corps.payeLe))
      .avecApprouveLe(
        ServiceAdministrationAdminUtilitaires.versDateOptionnelle(
          corps.approvedAt || corps.approuveLe
        )
      )
      .avecApprouvePar(
        ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.approvedBy || corps.approuvePar) || null
      )
      .avecModeAbonnement(this.normaliserModeAbonnement(corps.subscriptionMode || corps.modeAbonnement))
      .avecDateCreation(ServiceAdministrationAdminUtilitaires.versDate(corps.createdAt || corps.creeLe))
      .construire()
  }
  public construireEntiteNotificationDepuisCorps(
    corps: Record<string, unknown>,
    utilisateurIdParDefaut: string,
    idForce?: string
  ): EntiteNotification {
    return new BuilderEntiteNotification()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecUtilisateurId(String(corps.user_id || corps.utilisateurId || utilisateurIdParDefaut))
      .avecMessage(String(corps.message || 'Notification'))
      .avecType(ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.type) || '')
      .avecEstLue(Boolean(corps.is_read || corps.estLue))
      .avecDateCreation(ServiceAdministrationAdminUtilitaires.versDate(corps.created_at || corps.creeLe))
      .construire()
  }
  public construireEntiteJournalAuditDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteJournalAudit {
    return new BuilderEntiteJournalAudit()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecActeur(ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.actor || corps.acteur) || '')
      .avecAction(ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.action) || '')
      .avecTypeCible(
        ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.targetType || corps.typeCible) || ''
      )
      .avecIdCible(
        ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.targetId || corps.idCible) || ''
      )
      .avecMessage(ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.message) || '')
      .avecAdresseIp(
        ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.ipAddress || corps.adresseIp) || ''
      )
      .avecDateCreation(ServiceAdministrationAdminUtilitaires.versDate(corps.createdAt || corps.creeLe))
      .construire()
  }
  public construireEntiteIpBloqueeDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteIpBloquee {
    return new BuilderEntiteIpBloquee()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecAdresseIp(String(corps.ip || corps.adresseIp || ''))
      .avecRaison(ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.reason || corps.raison) || '')
      .avecDateCreation(ServiceAdministrationAdminUtilitaires.versDate(corps.createdAt || corps.creeLe))
      .construire()
  }
  public async creerStatutAbonnementParDefaut(
    adminId: string,
    daoStatutAbonnementAdmin: InterfaceDaoStatutAbonnementAdmin
  ) {
    const mois = ServiceAdministrationAdminUtilitaires.moisCourant()
    const entite = new BuilderEntiteStatutAbonnementAdmin()
      .avecAdminId(adminId)
      .avecBloque(false)
      .avecMoisEnRetard(null)
      .avecMoisRequis(mois)
      .avecMoisCourant(mois)
      .avecJoursGrace(5)
      .avecModeAbonnement('monthly')
      .avecMontantAttendu(5000)
      .avecAutoriserMontantLibre(false)
      .construire()
    await daoStatutAbonnementAdmin.sauvegarder(entite)
    return entite
  }
  public async mettreAJourStatutDepuisPaiementAdmin(
    paiement: EntitePaiementAbonnementAdmin,
    daoStatutAbonnementAdmin: InterfaceDaoStatutAbonnementAdmin
  ): Promise<void> {
    const existant = await daoStatutAbonnementAdmin.rechercherParId(paiement.adminId)
    const courant = existant || (await this.creerStatutAbonnementParDefaut(paiement.adminId, daoStatutAbonnementAdmin))
    const mode = paiement.modeAbonnement || courant.modeAbonnement
    const moisCourantActuel = ServiceAdministrationAdminUtilitaires.moisCourant()
    const estPaye = paiement.statut === 'paid'
    const suivant = new BuilderEntiteStatutAbonnementAdmin()
      .avecAdminId(courant.adminId)
      .avecBloque(!estPaye && paiement.mois <= moisCourantActuel)
      .avecMoisEnRetard(estPaye ? null : paiement.mois)
      .avecEcheance(estPaye ? null : new Date())
      .avecMoisRequis(moisCourantActuel)
      .avecMoisCourant(moisCourantActuel)
      .avecJoursGrace(courant.joursGrace)
      .avecModeAbonnement(mode)
      .avecMontantAttendu(paiement.montant)
      .avecAutoriserMontantLibre(courant.autoriserMontantLibre)
      .construire()
    await daoStatutAbonnementAdmin.sauvegarder(suivant)
  }
  public normaliserStatutMouvement(valeur: unknown): TypeStatutMouvement {
    const statut = String(valeur || 'completed').toLowerCase()
    if (statut === 'pending' || statut === 'completed' || statut === 'failed') return statut
    return 'completed'
  }
  private normaliserPriorite(valeur: unknown): 'low' | 'medium' | 'high' {
    const priorite = String(valeur || 'medium').toLowerCase()
    if (priorite === 'low' || priorite === 'medium' || priorite === 'high') return priorite
    return 'medium'
  }
  private normaliserStatutTravail(valeur: unknown): 'pending' | 'in-progress' | 'completed' {
    const statut = String(valeur || 'pending').toLowerCase().replace('_', '-')
    if (statut === 'pending' || statut === 'in-progress' || statut === 'completed') return statut
    return 'pending'
  }
  private normaliserMethodePaiementAdmin(valeur: unknown): 'wave' | 'orange_money' | 'cash' {
    const methode = String(valeur || 'wave').toLowerCase()
    if (methode === 'wave' || methode === 'orange_money' || methode === 'cash') return methode
    return 'wave'
  }
  private normaliserStatutPaiementAdmin(
    valeur: unknown
  ): 'pending' | 'paid' | 'failed' | 'cancelled' {
    const statut = String(valeur || 'pending').toLowerCase()
    if (statut === 'pending' || statut === 'paid' || statut === 'failed' || statut === 'cancelled') {
      return statut
    }
    return 'pending'
  }
  private normaliserModeAbonnement(valeur: unknown): 'monthly' | 'premium' | 'annual' {
    const mode = String(valeur || 'monthly').toLowerCase()
    if (mode === 'monthly' || mode === 'premium' || mode === 'annual') return mode
    return 'monthly'
  }
  private normaliserFournisseurPaiement(
    valeur: unknown
  ): 'stripe' | 'wave' | 'orange' | 'manual' {
    const fournisseur = String(valeur || 'manual').toLowerCase()
    if (
      fournisseur === 'stripe' ||
      fournisseur === 'wave' ||
      fournisseur === 'orange' ||
      fournisseur === 'manual'
    ) {
      return fournisseur
    }
    return 'manual'
  }
}
