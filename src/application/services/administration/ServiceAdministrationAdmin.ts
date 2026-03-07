import { MappeurAdministrationAdmin } from '@/src/application/mappers'
import { TypeStatutMouvement } from '@/src/domaine/types/administration'
import { ServiceAdministrationAdminAnnulation } from '@/src/application/services/administration/commun/ServiceAdministrationAdminAnnulation'
import { ServiceAdministrationAdminAuditIpsCloudinary } from '@/src/application/services/administration/audit/ServiceAdministrationAdminAuditIpsCloudinary'
import { ServiceAdministrationAdminClientsLocations } from '@/src/application/services/administration/clients/ServiceAdministrationAdminClientsLocations'
import { ServiceAdministrationAdminConstructeursLocations } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursLocations'
import { ServiceAdministrationAdminConstructeursSysteme } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursSysteme'
import { ServiceAdministrationAdminDocuments } from '@/src/application/services/administration/documents/ServiceAdministrationAdminDocuments'
import { ServiceAdministrationAdminNotificationsAnnulation } from '@/src/application/services/administration/notifications/ServiceAdministrationAdminNotificationsAnnulation'
import { ServiceAdministrationAdminPaiementsAdmin } from '@/src/application/services/administration/paiements/ServiceAdministrationAdminPaiementsAdmin'
import { ServiceAdministrationAdminPaiementsDepots } from '@/src/application/services/administration/paiements/ServiceAdministrationAdminPaiementsDepots'
import { ServiceAdministrationAdminSecurite } from '@/src/application/services/administration/commun/ServiceAdministrationAdminSecurite'
import { ServiceAdministrationAdminTravauxParametresImports } from '@/src/application/services/administration/travaux/ServiceAdministrationAdminTravauxParametresImports'
import type { TypeDependancesServiceAdministrationAdmin } from '@/src/application/types/administration/TypeDependancesServiceAdministrationAdmin'

type TypeCleMethode<T extends object> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never
}[keyof T]

export class ServiceAdministrationAdmin {
  private readonly serviceClientsLocations: ServiceAdministrationAdminClientsLocations
  private readonly serviceDocuments: ServiceAdministrationAdminDocuments
  private readonly servicePaiementsDepots: ServiceAdministrationAdminPaiementsDepots
  private readonly serviceTravauxParametresImports: ServiceAdministrationAdminTravauxParametresImports
  private readonly serviceNotificationsAnnulation: ServiceAdministrationAdminNotificationsAnnulation
  private readonly servicePaiementsAdmin: ServiceAdministrationAdminPaiementsAdmin
  private readonly serviceAuditIpsCloudinary: ServiceAdministrationAdminAuditIpsCloudinary

  public readonly listerClients: ServiceAdministrationAdminClientsLocations['listerClients']
  public readonly obtenirClient: ServiceAdministrationAdminClientsLocations['obtenirClient']
  public readonly creerClient: ServiceAdministrationAdminClientsLocations['creerClient']
  public readonly mettreAJourClient: ServiceAdministrationAdminClientsLocations['mettreAJourClient']
  public readonly supprimerClient: ServiceAdministrationAdminClientsLocations['supprimerClient']
  public readonly listerLocations: ServiceAdministrationAdminClientsLocations['listerLocations']
  public readonly obtenirLocation: ServiceAdministrationAdminClientsLocations['obtenirLocation']
  public readonly creerLocation: ServiceAdministrationAdminClientsLocations['creerLocation']
  public readonly mettreAJourLocation: ServiceAdministrationAdminClientsLocations['mettreAJourLocation']
  public readonly supprimerLocation: ServiceAdministrationAdminClientsLocations['supprimerLocation']
  public readonly listerDocuments: ServiceAdministrationAdminDocuments['listerDocuments']
  public readonly obtenirDocument: ServiceAdministrationAdminDocuments['obtenirDocument']
  public readonly creerDocument: ServiceAdministrationAdminDocuments['creerDocument']
  public readonly mettreAJourDocument: ServiceAdministrationAdminDocuments['mettreAJourDocument']
  public readonly supprimerDocument: ServiceAdministrationAdminDocuments['supprimerDocument']
  public readonly listerPaiements: ServiceAdministrationAdminPaiementsDepots['listerPaiements']
  public readonly obtenirPaiement: ServiceAdministrationAdminPaiementsDepots['obtenirPaiement']
  public readonly creerPaiement: ServiceAdministrationAdminPaiementsDepots['creerPaiement']
  public readonly mettreAJourPaiement: ServiceAdministrationAdminPaiementsDepots['mettreAJourPaiement']
  public readonly supprimerPaiement: ServiceAdministrationAdminPaiementsDepots['supprimerPaiement']
  public readonly listerDepots: ServiceAdministrationAdminPaiementsDepots['listerDepots']
  public readonly obtenirDepot: ServiceAdministrationAdminPaiementsDepots['obtenirDepot']
  public readonly creerDepot: ServiceAdministrationAdminPaiementsDepots['creerDepot']
  public readonly mettreAJourDepot: ServiceAdministrationAdminPaiementsDepots['mettreAJourDepot']
  public readonly supprimerDepot: ServiceAdministrationAdminPaiementsDepots['supprimerDepot']
  public readonly listerTravaux: ServiceAdministrationAdminTravauxParametresImports['listerTravaux']
  public readonly obtenirTravail: ServiceAdministrationAdminTravauxParametresImports['obtenirTravail']
  public readonly creerTravail: ServiceAdministrationAdminTravauxParametresImports['creerTravail']
  public readonly mettreAJourTravail: ServiceAdministrationAdminTravauxParametresImports['mettreAJourTravail']
  public readonly supprimerTravail: ServiceAdministrationAdminTravauxParametresImports['supprimerTravail']
  public readonly listerParametres: ServiceAdministrationAdminTravauxParametresImports['listerParametres']
  public readonly creerParametre: ServiceAdministrationAdminTravauxParametresImports['creerParametre']
  public readonly mettreAJourParametre: ServiceAdministrationAdminTravauxParametresImports['mettreAJourParametre']
  public readonly supprimerParametre: ServiceAdministrationAdminTravauxParametresImports['supprimerParametre']
  public readonly listerImports: ServiceAdministrationAdminTravauxParametresImports['listerImports']
  public readonly obtenirImport: ServiceAdministrationAdminTravauxParametresImports['obtenirImport']
  public readonly creerImport: ServiceAdministrationAdminTravauxParametresImports['creerImport']
  public readonly mettreAJourImport: ServiceAdministrationAdminTravauxParametresImports['mettreAJourImport']
  public readonly listerNotifications: ServiceAdministrationAdminNotificationsAnnulation['listerNotifications']
  public readonly marquerNotificationLue: ServiceAdministrationAdminNotificationsAnnulation['marquerNotificationLue']
  public readonly listerActionsAnnulation: ServiceAdministrationAdminNotificationsAnnulation['listerActionsAnnulation']
  public readonly annulerAction: ServiceAdministrationAdminNotificationsAnnulation['annulerAction']
  public readonly listerPaiementsAdmin: ServiceAdministrationAdminPaiementsAdmin['listerPaiementsAdmin']
  public readonly obtenirPaiementAdmin: ServiceAdministrationAdminPaiementsAdmin['obtenirPaiementAdmin']
  public readonly creerPaiementAdmin: ServiceAdministrationAdminPaiementsAdmin['creerPaiementAdmin']
  public readonly mettreAJourPaiementAdmin: ServiceAdministrationAdminPaiementsAdmin['mettreAJourPaiementAdmin']
  public readonly supprimerPaiementAdmin: ServiceAdministrationAdminPaiementsAdmin['supprimerPaiementAdmin']
  public readonly obtenirStatutPaiementAdmin: ServiceAdministrationAdminPaiementsAdmin['obtenirStatutPaiementAdmin']
  public readonly listerJournauxAudit: ServiceAdministrationAdminAuditIpsCloudinary['listerJournauxAudit']
  public readonly obtenirJournalAudit: ServiceAdministrationAdminAuditIpsCloudinary['obtenirJournalAudit']
  public readonly creerJournalAudit: ServiceAdministrationAdminAuditIpsCloudinary['creerJournalAudit']
  public readonly supprimerJournalAudit: ServiceAdministrationAdminAuditIpsCloudinary['supprimerJournalAudit']
  public readonly appliquerRetentionJournauxAudit: ServiceAdministrationAdminAuditIpsCloudinary['appliquerRetentionJournauxAudit']
  public readonly listerIpsBloquees: ServiceAdministrationAdminAuditIpsCloudinary['listerIpsBloquees']
  public readonly obtenirIpBloquee: ServiceAdministrationAdminAuditIpsCloudinary['obtenirIpBloquee']
  public readonly bloquerIp: ServiceAdministrationAdminAuditIpsCloudinary['bloquerIp']
  public readonly debloquerIp: ServiceAdministrationAdminAuditIpsCloudinary['debloquerIp']
  public readonly ouvrirUrlCloudinary: ServiceAdministrationAdminAuditIpsCloudinary['ouvrirUrlCloudinary']
  constructor(private readonly dependances: TypeDependancesServiceAdministrationAdmin) {
    const statutsPaiement = new Map<string, TypeStatutMouvement>()
    const statutsDepot = new Map<string, TypeStatutMouvement>()
    const mappeur = new MappeurAdministrationAdmin(statutsPaiement, statutsDepot)
    const securite = new ServiceAdministrationAdminSecurite(
      this.dependances.serviceAuthentification
    )
    const annulation = new ServiceAdministrationAdminAnnulation()
    const constructeurLocations = new ServiceAdministrationAdminConstructeursLocations()
    const constructeurSysteme = new ServiceAdministrationAdminConstructeursSysteme()
    this.serviceClientsLocations = new ServiceAdministrationAdminClientsLocations({
      securite,
      annulation,
      daoClient: this.dependances.daoClient,
      constructeur: constructeurLocations,
      mappeur,
      statutsPaiement,
      statutsDepot,
    })
    this.serviceDocuments = new ServiceAdministrationAdminDocuments({
      securite,
      annulation,
      daoDocument: this.dependances.daoDocument,
      constructeur: constructeurLocations,
      mappeur,
    })
    this.servicePaiementsDepots = new ServiceAdministrationAdminPaiementsDepots({
      securite,
      annulation,
      daoTransactionPaiement: this.dependances.daoTransactionPaiement,
      daoPaiementCaution: this.dependances.daoPaiementCaution,
      constructeurLocations,
      constructeurSysteme,
      mappeur,
      statutsPaiement,
      statutsDepot,
    })
    this.serviceTravauxParametresImports = new ServiceAdministrationAdminTravauxParametresImports({
      securite,
      annulation,
      daoItemTravail: this.dependances.daoItemTravail,
      daoExecutionImport: this.dependances.daoExecutionImport,
      daoParametreAdmin: this.dependances.daoParametreAdmin,
      constructeur: constructeurSysteme,
      mappeur,
    })
    this.serviceNotificationsAnnulation = new ServiceAdministrationAdminNotificationsAnnulation({
      securite,
      annulation,
      daoNotification: this.dependances.daoNotification,
      constructeur: constructeurSysteme,
      mappeur,
    })
    this.servicePaiementsAdmin = new ServiceAdministrationAdminPaiementsAdmin({
      securite,
      annulation,
      daoPaiementAbonnementAdmin: this.dependances.daoPaiementAbonnementAdmin,
      daoStatutAbonnementAdmin: this.dependances.daoStatutAbonnementAdmin,
      constructeur: constructeurSysteme,
      mappeur,
    })
    this.serviceAuditIpsCloudinary = new ServiceAdministrationAdminAuditIpsCloudinary({
      securite,
      annulation,
      daoJournalAudit: this.dependances.daoJournalAudit,
      daoIpBloquee: this.dependances.daoIpBloquee,
      constructeur: constructeurSysteme,
      mappeur,
    })
    this.listerClients = this.lierMethode(this.serviceClientsLocations, 'listerClients')
    this.obtenirClient = this.lierMethode(this.serviceClientsLocations, 'obtenirClient')
    this.creerClient = this.lierMethode(this.serviceClientsLocations, 'creerClient')
    this.mettreAJourClient = this.lierMethode(this.serviceClientsLocations, 'mettreAJourClient')
    this.supprimerClient = this.lierMethode(this.serviceClientsLocations, 'supprimerClient')
    this.listerLocations = this.lierMethode(this.serviceClientsLocations, 'listerLocations')
    this.obtenirLocation = this.lierMethode(this.serviceClientsLocations, 'obtenirLocation')
    this.creerLocation = this.lierMethode(this.serviceClientsLocations, 'creerLocation')
    this.mettreAJourLocation = this.lierMethode(this.serviceClientsLocations, 'mettreAJourLocation')
    this.supprimerLocation = this.lierMethode(this.serviceClientsLocations, 'supprimerLocation')
    this.listerDocuments = this.lierMethode(this.serviceDocuments, 'listerDocuments')
    this.obtenirDocument = this.lierMethode(this.serviceDocuments, 'obtenirDocument')
    this.creerDocument = this.lierMethode(this.serviceDocuments, 'creerDocument')
    this.mettreAJourDocument = this.lierMethode(this.serviceDocuments, 'mettreAJourDocument')
    this.supprimerDocument = this.lierMethode(this.serviceDocuments, 'supprimerDocument')
    this.listerPaiements = this.lierMethode(this.servicePaiementsDepots, 'listerPaiements')
    this.obtenirPaiement = this.lierMethode(this.servicePaiementsDepots, 'obtenirPaiement')
    this.creerPaiement = this.lierMethode(this.servicePaiementsDepots, 'creerPaiement')
    this.mettreAJourPaiement = this.lierMethode(this.servicePaiementsDepots, 'mettreAJourPaiement')
    this.supprimerPaiement = this.lierMethode(this.servicePaiementsDepots, 'supprimerPaiement')
    this.listerDepots = this.lierMethode(this.servicePaiementsDepots, 'listerDepots')
    this.obtenirDepot = this.lierMethode(this.servicePaiementsDepots, 'obtenirDepot')
    this.creerDepot = this.lierMethode(this.servicePaiementsDepots, 'creerDepot')
    this.mettreAJourDepot = this.lierMethode(this.servicePaiementsDepots, 'mettreAJourDepot')
    this.supprimerDepot = this.lierMethode(this.servicePaiementsDepots, 'supprimerDepot')
    this.listerTravaux = this.lierMethode(this.serviceTravauxParametresImports, 'listerTravaux')
    this.obtenirTravail = this.lierMethode(this.serviceTravauxParametresImports, 'obtenirTravail')
    this.creerTravail = this.lierMethode(this.serviceTravauxParametresImports, 'creerTravail')
    this.mettreAJourTravail = this.lierMethode(this.serviceTravauxParametresImports, 'mettreAJourTravail')
    this.supprimerTravail = this.lierMethode(this.serviceTravauxParametresImports, 'supprimerTravail')
    this.listerParametres = this.lierMethode(this.serviceTravauxParametresImports, 'listerParametres')
    this.creerParametre = this.lierMethode(this.serviceTravauxParametresImports, 'creerParametre')
    this.mettreAJourParametre = this.lierMethode(this.serviceTravauxParametresImports, 'mettreAJourParametre')
    this.supprimerParametre = this.lierMethode(this.serviceTravauxParametresImports, 'supprimerParametre')
    this.listerImports = this.lierMethode(this.serviceTravauxParametresImports, 'listerImports')
    this.obtenirImport = this.lierMethode(this.serviceTravauxParametresImports, 'obtenirImport')
    this.creerImport = this.lierMethode(this.serviceTravauxParametresImports, 'creerImport')
    this.mettreAJourImport = this.lierMethode(this.serviceTravauxParametresImports, 'mettreAJourImport')
    this.listerNotifications = this.lierMethode(this.serviceNotificationsAnnulation, 'listerNotifications')
    this.marquerNotificationLue = this.lierMethode(this.serviceNotificationsAnnulation, 'marquerNotificationLue')
    this.listerActionsAnnulation = this.lierMethode(this.serviceNotificationsAnnulation, 'listerActionsAnnulation')
    this.annulerAction = this.lierMethode(this.serviceNotificationsAnnulation, 'annulerAction')
    this.listerPaiementsAdmin = this.lierMethode(this.servicePaiementsAdmin, 'listerPaiementsAdmin')
    this.obtenirPaiementAdmin = this.lierMethode(this.servicePaiementsAdmin, 'obtenirPaiementAdmin')
    this.creerPaiementAdmin = this.lierMethode(this.servicePaiementsAdmin, 'creerPaiementAdmin')
    this.mettreAJourPaiementAdmin = this.lierMethode(this.servicePaiementsAdmin, 'mettreAJourPaiementAdmin')
    this.supprimerPaiementAdmin = this.lierMethode(this.servicePaiementsAdmin, 'supprimerPaiementAdmin')
    this.obtenirStatutPaiementAdmin = this.lierMethode(this.servicePaiementsAdmin, 'obtenirStatutPaiementAdmin')
    this.listerJournauxAudit = this.lierMethode(this.serviceAuditIpsCloudinary, 'listerJournauxAudit')
    this.obtenirJournalAudit = this.lierMethode(this.serviceAuditIpsCloudinary, 'obtenirJournalAudit')
    this.creerJournalAudit = this.lierMethode(this.serviceAuditIpsCloudinary, 'creerJournalAudit')
    this.supprimerJournalAudit = this.lierMethode(this.serviceAuditIpsCloudinary, 'supprimerJournalAudit')
    this.appliquerRetentionJournauxAudit = this.lierMethode(
      this.serviceAuditIpsCloudinary,
      'appliquerRetentionJournauxAudit'
    )
    this.listerIpsBloquees = this.lierMethode(this.serviceAuditIpsCloudinary, 'listerIpsBloquees')
    this.obtenirIpBloquee = this.lierMethode(this.serviceAuditIpsCloudinary, 'obtenirIpBloquee')
    this.bloquerIp = this.lierMethode(this.serviceAuditIpsCloudinary, 'bloquerIp')
    this.debloquerIp = this.lierMethode(this.serviceAuditIpsCloudinary, 'debloquerIp')
    this.ouvrirUrlCloudinary = this.lierMethode(this.serviceAuditIpsCloudinary, 'ouvrirUrlCloudinary')
  }
  private lierMethode<T extends object, K extends TypeCleMethode<T>>(source: T, nom: K): T[K] {
    const methode = source[nom] as unknown as (...args: never[]) => unknown
    return methode.bind(source) as T[K]
  }
}
