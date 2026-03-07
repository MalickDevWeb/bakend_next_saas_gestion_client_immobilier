import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { ServiceAdministrationAdmin } from '@/src/application/services/administration/ServiceAdministrationAdmin'
import { ServiceAdministrationAdminSupervision } from '@/src/application/services/administration/supervision/ServiceAdministrationAdminSupervision'

export class ControleurAdministrationAdmin {
  constructor(
    private readonly serviceAdministrationAdmin: ServiceAdministrationAdmin,
    private readonly serviceAdministrationAdminSupervision: ServiceAdministrationAdminSupervision
  ) {}

  public async listerClients(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    requeteUrl: URL
  ) {
    return this.serviceAdministrationAdmin.listerClients(
      jetonAcces,
      impersonation,
      requeteUrl.searchParams.get('_sort') || requeteUrl.searchParams.get('sortBy'),
      requeteUrl.searchParams.get('_order') || requeteUrl.searchParams.get('order')
    )
  }

  public async obtenirClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    clientId: string
  ) {
    return this.serviceAdministrationAdmin.obtenirClient(jetonAcces, impersonation, clientId)
  }

  public async creerClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.creerClient(jetonAcces, impersonation, corps)
  }

  public async mettreAJourClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    clientId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.mettreAJourClient(
      jetonAcces,
      impersonation,
      clientId,
      corps
    )
  }

  public async supprimerClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    clientId: string
  ) {
    return this.serviceAdministrationAdmin.supprimerClient(jetonAcces, impersonation, clientId)
  }

  public async listerLocations(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    requeteUrl: URL
  ) {
    return this.serviceAdministrationAdmin.listerLocations(
      jetonAcces,
      impersonation,
      requeteUrl.searchParams.get('_sort') || requeteUrl.searchParams.get('sortBy'),
      requeteUrl.searchParams.get('_order') || requeteUrl.searchParams.get('order')
    )
  }

  public async obtenirLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    locationId: string
  ) {
    return this.serviceAdministrationAdmin.obtenirLocation(
      jetonAcces,
      impersonation,
      locationId
    )
  }

  public async creerLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.creerLocation(jetonAcces, impersonation, corps)
  }

  public async mettreAJourLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    locationId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.mettreAJourLocation(
      jetonAcces,
      impersonation,
      locationId,
      corps
    )
  }

  public async supprimerLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    locationId: string
  ) {
    return this.serviceAdministrationAdmin.supprimerLocation(
      jetonAcces,
      impersonation,
      locationId
    )
  }

  public async listerDocuments(jetonAcces: string, impersonation: DtoEtatImpersonation) {
    return this.serviceAdministrationAdmin.listerDocuments(jetonAcces, impersonation)
  }

  public async obtenirDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    documentId: string
  ) {
    return this.serviceAdministrationAdmin.obtenirDocument(jetonAcces, impersonation, documentId)
  }

  public async creerDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.creerDocument(jetonAcces, impersonation, corps)
  }

  public async supprimerDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    documentId: string
  ) {
    return this.serviceAdministrationAdmin.supprimerDocument(jetonAcces, impersonation, documentId)
  }

  public async mettreAJourDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    documentId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.mettreAJourDocument(
      jetonAcces,
      impersonation,
      documentId,
      corps
    )
  }

  public async listerPaiements(jetonAcces: string, impersonation: DtoEtatImpersonation) {
    return this.serviceAdministrationAdmin.listerPaiements(jetonAcces, impersonation)
  }

  public async obtenirPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ) {
    return this.serviceAdministrationAdmin.obtenirPaiement(jetonAcces, impersonation, paiementId)
  }

  public async creerPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.creerPaiement(jetonAcces, impersonation, corps)
  }

  public async mettreAJourPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.mettreAJourPaiement(
      jetonAcces,
      impersonation,
      paiementId,
      corps
    )
  }

  public async supprimerPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ) {
    return this.serviceAdministrationAdmin.supprimerPaiement(jetonAcces, impersonation, paiementId)
  }

  public async listerDepots(jetonAcces: string, impersonation: DtoEtatImpersonation) {
    return this.serviceAdministrationAdmin.listerDepots(jetonAcces, impersonation)
  }

  public async obtenirDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    depotId: string
  ) {
    return this.serviceAdministrationAdmin.obtenirDepot(jetonAcces, impersonation, depotId)
  }

  public async creerDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.creerDepot(jetonAcces, impersonation, corps)
  }

  public async mettreAJourDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    depotId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.mettreAJourDepot(jetonAcces, impersonation, depotId, corps)
  }

  public async supprimerDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    depotId: string
  ) {
    return this.serviceAdministrationAdmin.supprimerDepot(jetonAcces, impersonation, depotId)
  }

  public async listerTravaux(jetonAcces: string, impersonation: DtoEtatImpersonation) {
    return this.serviceAdministrationAdmin.listerTravaux(jetonAcces, impersonation)
  }

  public async obtenirTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    travailId: string
  ) {
    return this.serviceAdministrationAdmin.obtenirTravail(jetonAcces, impersonation, travailId)
  }

  public async creerTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.creerTravail(jetonAcces, impersonation, corps)
  }

  public async mettreAJourTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    travailId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.mettreAJourTravail(
      jetonAcces,
      impersonation,
      travailId,
      corps
    )
  }

  public async supprimerTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    travailId: string
  ) {
    return this.serviceAdministrationAdmin.supprimerTravail(jetonAcces, impersonation, travailId)
  }

  public async listerParametres(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    requeteUrl: URL
  ) {
    return this.serviceAdministrationAdmin.listerParametres(
      jetonAcces,
      impersonation,
      requeteUrl.searchParams.get('key')
    )
  }

  public async creerParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.creerParametre(jetonAcces, impersonation, corps)
  }

  public async mettreAJourParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    parametreId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.mettreAJourParametre(
      jetonAcces,
      impersonation,
      parametreId,
      corps
    )
  }

  public async supprimerParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    parametreId: string
  ) {
    return this.serviceAdministrationAdmin.supprimerParametre(jetonAcces, impersonation, parametreId)
  }

  public async listerImports(jetonAcces: string, impersonation: DtoEtatImpersonation) {
    return this.serviceAdministrationAdmin.listerImports(jetonAcces, impersonation)
  }

  public async obtenirImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    importId: string
  ) {
    return this.serviceAdministrationAdmin.obtenirImport(jetonAcces, impersonation, importId)
  }

  public async creerImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.creerImport(jetonAcces, impersonation, corps)
  }

  public async mettreAJourImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    importId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.mettreAJourImport(jetonAcces, impersonation, importId, corps)
  }

  public async listerNotifications(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    requeteUrl: URL
  ) {
    return this.serviceAdministrationAdmin.listerNotifications(
      jetonAcces,
      impersonation,
      requeteUrl.searchParams.get('user_id') || requeteUrl.searchParams.get('utilisateurId'),
      requeteUrl.searchParams.get('_sort') || requeteUrl.searchParams.get('sortBy'),
      requeteUrl.searchParams.get('_order') || requeteUrl.searchParams.get('order')
    )
  }

  public async marquerNotificationLue(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    notificationId: string
  ) {
    return this.serviceAdministrationAdmin.marquerNotificationLue(
      jetonAcces,
      impersonation,
      notificationId
    )
  }

  public async listerActionsAnnulation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    requeteUrl: URL
  ) {
    const brut = Number(requeteUrl.searchParams.get('limit') || '10')
    const limite = Number.isFinite(brut) ? Math.floor(brut) : 10
    return this.serviceAdministrationAdmin.listerActionsAnnulation(jetonAcces, impersonation, limite)
  }

  public async annulerAction(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    actionId: string
  ) {
    return this.serviceAdministrationAdmin.annulerAction(jetonAcces, impersonation, actionId)
  }

  public async listerPaiementsAdmin(jetonAcces: string, impersonation: DtoEtatImpersonation) {
    return this.serviceAdministrationAdmin.listerPaiementsAdmin(jetonAcces, impersonation)
  }

  public async obtenirPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ) {
    return this.serviceAdministrationAdmin.obtenirPaiementAdmin(jetonAcces, impersonation, paiementId)
  }

  public async creerPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.creerPaiementAdmin(jetonAcces, impersonation, corps)
  }

  public async obtenirStatutPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    requeteUrl: URL
  ) {
    return this.serviceAdministrationAdmin.obtenirStatutPaiementAdmin(
      jetonAcces,
      impersonation,
      requeteUrl.searchParams.get('adminId')
    )
  }

  public async mettreAJourPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.mettreAJourPaiementAdmin(
      jetonAcces,
      impersonation,
      paiementId,
      corps
    )
  }

  public async supprimerPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ) {
    return this.serviceAdministrationAdmin.supprimerPaiementAdmin(
      jetonAcces,
      impersonation,
      paiementId
    )
  }

  public async listerJournauxAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    requeteUrl: URL
  ) {
    return this.serviceAdministrationAdmin.listerJournauxAudit(
      jetonAcces,
      impersonation,
      requeteUrl.searchParams.get('_sort') || requeteUrl.searchParams.get('sortBy'),
      requeteUrl.searchParams.get('_order') || requeteUrl.searchParams.get('order')
    )
  }

  public async obtenirJournalAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    journalId: string
  ) {
    return this.serviceAdministrationAdmin.obtenirJournalAudit(jetonAcces, impersonation, journalId)
  }

  public async creerJournalAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.creerJournalAudit(jetonAcces, impersonation, corps)
  }

  public async supprimerJournalAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    journalId: string
  ) {
    return this.serviceAdministrationAdmin.supprimerJournalAudit(
      jetonAcces,
      impersonation,
      journalId
    )
  }

  public async appliquerRetentionJournauxAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    retentionDays: number
  ) {
    return this.serviceAdministrationAdmin.appliquerRetentionJournauxAudit(
      jetonAcces,
      impersonation,
      retentionDays
    )
  }

  public async listerIpsBloquees(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    requeteUrl: URL
  ) {
    return this.serviceAdministrationAdmin.listerIpsBloquees(
      jetonAcces,
      impersonation,
      requeteUrl.searchParams.get('_sort') || requeteUrl.searchParams.get('sortBy'),
      requeteUrl.searchParams.get('_order') || requeteUrl.searchParams.get('order')
    )
  }

  public async obtenirIpBloquee(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    ipId: string
  ) {
    return this.serviceAdministrationAdmin.obtenirIpBloquee(jetonAcces, impersonation, ipId)
  }

  public async bloquerIp(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.bloquerIp(jetonAcces, impersonation, corps)
  }

  public async debloquerIp(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    ipId: string
  ) {
    return this.serviceAdministrationAdmin.debloquerIp(jetonAcces, impersonation, ipId)
  }

  public async ouvrirUrlCloudinary(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdmin.ouvrirUrlCloudinary(
      jetonAcces,
      impersonation,
      String(corps.url || '')
    )
  }

  public async listerAdmins(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    requeteUrl: URL
  ) {
    return this.serviceAdministrationAdminSupervision.listerAdmins(
      jetonAcces,
      impersonation,
      requeteUrl.searchParams.get('_sort') || requeteUrl.searchParams.get('sortBy'),
      requeteUrl.searchParams.get('_order') || requeteUrl.searchParams.get('order')
    )
  }

  public async obtenirAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    adminId: string
  ) {
    return this.serviceAdministrationAdminSupervision.obtenirAdmin(
      jetonAcces,
      impersonation,
      adminId
    )
  }

  public async creerAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdminSupervision.creerAdmin(jetonAcces, impersonation, corps)
  }

  public async mettreAJourAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    adminId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdminSupervision.mettreAJourAdmin(
      jetonAcces,
      impersonation,
      adminId,
      corps
    )
  }

  public async supprimerAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    adminId: string
  ) {
    return this.serviceAdministrationAdminSupervision.supprimerAdmin(
      jetonAcces,
      impersonation,
      adminId
    )
  }

  public async listerDemandesAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    requeteUrl: URL
  ) {
    return this.serviceAdministrationAdminSupervision.listerDemandesAdmin(
      jetonAcces,
      impersonation,
      requeteUrl.searchParams.get('_sort') || requeteUrl.searchParams.get('sortBy'),
      requeteUrl.searchParams.get('_order') || requeteUrl.searchParams.get('order')
    )
  }

  public async obtenirDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    demandeId: string
  ) {
    return this.serviceAdministrationAdminSupervision.obtenirDemandeAdmin(
      jetonAcces,
      impersonation,
      demandeId
    )
  }

  public async creerDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdminSupervision.creerDemandeAdmin(
      jetonAcces,
      impersonation,
      corps
    )
  }

  public async creerDemandeAdminPublique(corps: Record<string, unknown>) {
    return this.serviceAdministrationAdminSupervision.creerDemandeAdminPublique(corps)
  }

  public async mettreAJourDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    demandeId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdminSupervision.mettreAJourDemandeAdmin(
      jetonAcces,
      impersonation,
      demandeId,
      corps
    )
  }

  public async supprimerDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    demandeId: string
  ) {
    return this.serviceAdministrationAdminSupervision.supprimerDemandeAdmin(
      jetonAcces,
      impersonation,
      demandeId
    )
  }

  public async listerEntreprises(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ) {
    return this.serviceAdministrationAdminSupervision.listerEntreprises(
      jetonAcces,
      impersonation
    )
  }

  public async obtenirEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    entrepriseId: string
  ) {
    return this.serviceAdministrationAdminSupervision.obtenirEntreprise(
      jetonAcces,
      impersonation,
      entrepriseId
    )
  }

  public async creerEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdminSupervision.creerEntreprise(
      jetonAcces,
      impersonation,
      corps
    )
  }

  public async mettreAJourEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    entrepriseId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdminSupervision.mettreAJourEntreprise(
      jetonAcces,
      impersonation,
      entrepriseId,
      corps
    )
  }

  public async supprimerEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    entrepriseId: string
  ) {
    return this.serviceAdministrationAdminSupervision.supprimerEntreprise(
      jetonAcces,
      impersonation,
      entrepriseId
    )
  }

  public async listerUtilisateurs(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ) {
    return this.serviceAdministrationAdminSupervision.listerUtilisateurs(
      jetonAcces,
      impersonation
    )
  }

  public async obtenirUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    utilisateurId: string
  ) {
    return this.serviceAdministrationAdminSupervision.obtenirUtilisateur(
      jetonAcces,
      impersonation,
      utilisateurId
    )
  }

  public async creerUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdminSupervision.creerUtilisateur(
      jetonAcces,
      impersonation,
      corps
    )
  }

  public async mettreAJourUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    utilisateurId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceAdministrationAdminSupervision.mettreAJourUtilisateur(
      jetonAcces,
      impersonation,
      utilisateurId,
      corps
    )
  }

  public async supprimerUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    utilisateurId: string
  ) {
    return this.serviceAdministrationAdminSupervision.supprimerUtilisateur(
      jetonAcces,
      impersonation,
      utilisateurId
    )
  }
}
