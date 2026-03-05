import { ServiceSante } from '@/src/application/services/sante/ServiceSante'
import { ControleurSante } from '@/src/controleurs/ControleurSante'
import { AdaptateurPrisma } from '@/src/infrastructure/base_de_donnees/AdaptateurPrisma'
import { ClientPrisma } from '@/src/infrastructure/base_de_donnees/ClientPrisma'
import { ValidateurZod } from '@/src/infrastructure/validateurs/ValidateurZod'
import { ConfigurationApplication } from '@/src/coeur/configuration/ConfigurationApplication'
import { ConfigurationSecurite } from '@/src/coeur/configuration/ConfigurationSecurite'
import { ServiceHachageMotDePasseArgon2 } from '@/src/infrastructure/securite/ServiceHachageMotDePasseArgon2'
import { ServiceJetonAccesJwt } from '@/src/infrastructure/securite/ServiceJetonAccesJwt'
import { ServiceTotp } from '@/src/infrastructure/securite/ServiceTotp'
import { ServiceChiffrementSymetrique } from '@/src/infrastructure/securite/ServiceChiffrementSymetrique'
import { ServiceAuditSecurite } from '@/src/infrastructure/securite/ServiceAuditSecurite'
import { ServiceAuditSecuriteMemoire } from '@/src/infrastructure/securite/ServiceAuditSecuriteMemoire'
import { ServiceAlerteSuperAdminWebhook } from '@/src/infrastructure/alertes/ServiceAlerteSuperAdminWebhook'
import { ServiceAuthentification } from '@/src/application/services/authentification/ServiceAuthentification'
import { ServiceContexteAuthentification } from '@/src/application/services/authentification/ServiceContexteAuthentification'
import { ServiceSessionAuthentification } from '@/src/application/services/authentification/ServiceSessionAuthentification'
import { ServiceSecuriteSessionAuthentification } from '@/src/application/services/authentification/ServiceSecuriteSessionAuthentification'
import { ServiceTotpSuperAdminAuthentification } from '@/src/application/services/authentification/ServiceTotpSuperAdminAuthentification'
import { ServiceAutorisationAuthentification } from '@/src/application/services/authentification/ServiceAutorisationAuthentification'
import { ServiceAuditAuthentification } from '@/src/application/services/authentification/ServiceAuditAuthentification'
import { ServiceImpersonationAuthentification } from '@/src/application/services/authentification/ServiceImpersonationAuthentification'
import { ValidateurAuthentification } from '@/src/application/validateurs/ValidateurAuthentification'
import { ControleurAuthContext } from '@/src/controleurs/ControleurAuthContext'
import { ServiceCookiesAuthentification } from '@/src/infrastructure/securite/ServiceCookiesAuthentification'
import { ServiceProtectionCsrf } from '@/src/infrastructure/securite/ServiceProtectionCsrf'
import { AdaptateurRequeteSecurite } from '@/src/infrastructure/securite/AdaptateurRequeteSecurite'
import { ServiceEntetesSecuriteHttp } from '@/src/infrastructure/securite/ServiceEntetesSecuriteHttp'
import { ServiceCorsStrict } from '@/src/infrastructure/securite/ServiceCorsStrict'
import { UtilitairesSecurite } from '@/src/infrastructure/securite/UtilitairesSecurite'
import { ReponseHttp } from '@/src/infrastructure/http/ReponseHttp'
import { ContexteRequeteHttp } from '@/src/infrastructure/http/ContexteRequeteHttp'
import { ValidateurAuthentificationZod } from '@/src/infrastructure/validateurs/ValidateurAuthentificationZod'
import {
  MappeurUtilisateurAuthentification,
} from '@/src/application/mappers'
import { DaoAuthentificationPrisma } from '@/src/infrastructure/dao/prisma/authentification/DaoAuthentificationPrisma'
import { DaoAuthentificationMemoire } from '@/src/infrastructure/dao/memoire/authentification/DaoAuthentificationMemoire'
import { InterfaceDaoAuthentification } from '@/src/domaine/interfaces/dao/authentification/InterfaceDaoAuthentification'
import { InterfaceRepositoryAuthentification } from '@/src/domaine/interfaces/repository/InterfaceRepositoryAuthentification'
import { InterfaceServiceHachageMotDePasse } from '@/src/coeur/interfaces/InterfaceServiceHachageMotDePasse'
import { InterfaceServiceJetonAcces } from '@/src/coeur/interfaces/InterfaceServiceJetonAcces'
import { InterfaceServiceTotp } from '@/src/coeur/interfaces/InterfaceServiceTotp'
import { InterfaceServiceChiffrement } from '@/src/coeur/interfaces/InterfaceServiceChiffrement'
import { InterfaceServiceAuditSecurite } from '@/src/coeur/interfaces/InterfaceServiceAuditSecurite'
import { InterfaceUtilitairesSecurite } from '@/src/coeur/interfaces/InterfaceUtilitairesSecurite'
import { RepositoryAuthentificationPrisma } from '@/src/infrastructure/repositories/prisma/RepositoryAuthentificationPrisma'
import { RepositoryAuthentificationMemoire } from '@/src/infrastructure/repositories/memoire/RepositoryAuthentificationMemoire'
import { FabriqueSessionAuthentification } from '@/src/application/fabriques/FabriqueSessionAuthentification'
import { FabriqueJetonRefresh } from '@/src/application/fabriques/FabriqueJetonRefresh'
import { ServiceAdministrationAdmin } from '@/src/application/services/administration/ServiceAdministrationAdmin'
import { ControleurAdministrationAdmin } from '@/src/controleurs/ControleurAdministrationAdmin'
import {
  DaoPaiementAbonnementAdminMemoire,
  DaoStatutAbonnementAdminMemoire,
} from '@/src/infrastructure/dao/memoire/administration'
import {
  DaoPaiementAbonnementAdminPrisma,
  DaoStatutAbonnementAdminPrisma,
} from '@/src/infrastructure/dao/prisma/administration'
import {
  DaoClientMemoire,
  DaoDocumentMemoire,
  DaoPaiementCautionMemoire,
  DaoTransactionPaiementMemoire,
} from '@/src/infrastructure/dao/memoire/locations'
import {
  DaoClientPrisma,
  DaoDocumentPrisma,
  DaoPaiementCautionPrisma,
  DaoTransactionPaiementPrisma,
} from '@/src/infrastructure/dao/prisma/locations'
import {
  DaoExecutionImportMemoire,
  DaoIpBloqueeMemoire,
  DaoItemTravailMemoire,
  DaoJournalAuditMemoire,
  DaoNotificationMemoire,
} from '@/src/infrastructure/dao/memoire/systeme'
import {
  DaoExecutionImportPrisma,
  DaoIpBloqueePrisma,
  DaoItemTravailPrisma,
  DaoJournalAuditPrisma,
  DaoNotificationPrisma,
  DaoParametreAdminPrisma,
} from '@/src/infrastructure/dao/prisma/systeme'
import { creerServiceAdministrationAdminSupervision } from '@/src/coeur/conteneur/FabriqueServiceAdministrationAdminSupervision'

class ConteneurDependances {
  public configurationApplication = new ConfigurationApplication()
  public configurationSecurite = new ConfigurationSecurite()
  public utiliseMemoire =
    this.configurationApplication.driverPersistanceAuthentification() === 'memoire'
  public prisma = ClientPrisma.obtenirInstance()
  public clientBaseDeDonnees = new AdaptateurPrisma()
  public validateurEntree = new ValidateurZod()
  public validateurAuthentificationInfrastructure = new ValidateurAuthentificationZod()
  public validateurAuthentification = new ValidateurAuthentification(
    this.validateurAuthentificationInfrastructure
  )
  public utilitairesSecurite: InterfaceUtilitairesSecurite = new UtilitairesSecurite()
  public reponseHttp = new ReponseHttp()
  public contexteRequeteHttp = new ContexteRequeteHttp(this.utilitairesSecurite)
  public mappeurUtilisateurAuthentification = new MappeurUtilisateurAuthentification(
    this.configurationSecurite
  )
  public serviceHachageMotDePasse: InterfaceServiceHachageMotDePasse = new ServiceHachageMotDePasseArgon2()
  public serviceJetonAcces: InterfaceServiceJetonAcces = new ServiceJetonAccesJwt(
    this.configurationSecurite.cleJwt(),
    this.configurationSecurite.dureeJetonAccesSecondes()
  )
  public serviceTotp: InterfaceServiceTotp = new ServiceTotp()
  public serviceChiffrement: InterfaceServiceChiffrement = new ServiceChiffrementSymetrique(
    this.configurationSecurite.cleChiffrementTotp()
  )
  public daoAuthentificationPrisma: InterfaceDaoAuthentification = new DaoAuthentificationPrisma(this.prisma)
  public daoAuthentificationMemoire = new DaoAuthentificationMemoire()
  public serviceAlerteSuperAdminWebhook = new ServiceAlerteSuperAdminWebhook(
    this.configurationSecurite.urlWebhookAlertesSuperAdmin()
  )
  public serviceAuditSecuritePrisma: InterfaceServiceAuditSecurite = new ServiceAuditSecurite(
    this.prisma,
    this.configurationSecurite.urlWebhookAlertes(),
    {
      apiToken: this.configurationSecurite.whatsappCloudApiToken(),
      phoneNumberId: this.configurationSecurite.whatsappCloudPhoneNumberId(),
      destination: this.configurationSecurite.whatsappCloudDestination(),
      apiVersion: this.configurationSecurite.whatsappCloudApiVersion(),
    },
    this.serviceAlerteSuperAdminWebhook
  )
  public serviceAuditSecuriteMemoire: InterfaceServiceAuditSecurite =
    new ServiceAuditSecuriteMemoire(this.daoAuthentificationMemoire)
  public serviceAuditSecurite: InterfaceServiceAuditSecurite =
    this.utiliseMemoire ? this.serviceAuditSecuriteMemoire : this.serviceAuditSecuritePrisma
  public serviceCookiesAuthentification = new ServiceCookiesAuthentification({
    modeSecurise: this.configurationSecurite.modeCookieSecurise(),
    sameSite: this.configurationSecurite.modeSameSiteCookies(),
  })
  public serviceProtectionCsrf = new ServiceProtectionCsrf()
  public adaptateurRequeteSecurite = new AdaptateurRequeteSecurite(this.serviceProtectionCsrf)
  public serviceEntetesSecuriteHttp = new ServiceEntetesSecuriteHttp()
  public serviceCorsStrict = new ServiceCorsStrict(this.configurationSecurite.originesCorsAutorisees())
  public repositoryAuthentificationPrisma: InterfaceRepositoryAuthentification =
    new RepositoryAuthentificationPrisma(this.daoAuthentificationPrisma)
  public repositoryAuthentificationMemoire: InterfaceRepositoryAuthentification =
    new RepositoryAuthentificationMemoire(this.daoAuthentificationMemoire)
  public repositoryAuthentification: InterfaceRepositoryAuthentification =
    this.utiliseMemoire ? this.repositoryAuthentificationMemoire : this.repositoryAuthentificationPrisma
  public fabriqueSessionAuthentification = new FabriqueSessionAuthentification()
  public fabriqueJetonRefresh = new FabriqueJetonRefresh()
  public serviceContexteAuthentification = new ServiceContexteAuthentification(
    this.repositoryAuthentification,
    this.serviceJetonAcces,
    this.mappeurUtilisateurAuthentification
  )
  public serviceSecuriteSessionAuthentification = new ServiceSecuriteSessionAuthentification(
    this.repositoryAuthentification,
    this.configurationSecurite,
    this.serviceAuditSecurite
  )
  public serviceSessionAuthentification = new ServiceSessionAuthentification(
    this.repositoryAuthentification,
    this.serviceHachageMotDePasse,
    this.serviceJetonAcces,
    this.serviceAuditSecurite,
    this.configurationSecurite,
    this.utilitairesSecurite,
    this.fabriqueSessionAuthentification,
    this.fabriqueJetonRefresh,
    this.mappeurUtilisateurAuthentification,
    this.serviceSecuriteSessionAuthentification
  )
  public serviceTotpSuperAdminAuthentification = new ServiceTotpSuperAdminAuthentification(
    this.serviceContexteAuthentification,
    this.serviceSecuriteSessionAuthentification,
    this.repositoryAuthentification,
    this.serviceTotp,
    this.serviceChiffrement,
    this.serviceAuditSecurite,
    this.serviceHachageMotDePasse,
    this.configurationApplication
  )
  public serviceAutorisationAuthentification = new ServiceAutorisationAuthentification(this.serviceContexteAuthentification)
  public serviceAuditAuthentification = new ServiceAuditAuthentification(this.repositoryAuthentification, this.serviceAutorisationAuthentification)
  public serviceImpersonationAuthentification = new ServiceImpersonationAuthentification(this.serviceContexteAuthentification, this.repositoryAuthentification)
  public serviceAuthentification = new ServiceAuthentification(
    this.serviceSessionAuthentification,
    this.serviceContexteAuthentification,
    this.serviceTotpSuperAdminAuthentification,
    this.serviceAutorisationAuthentification,
    this.serviceAuditAuthentification,
    this.serviceImpersonationAuthentification
  )
  public controleurAuthContext = new ControleurAuthContext(this.serviceAuthentification, this.validateurAuthentification)
  public daoClientMemoire = new DaoClientMemoire()
  public daoClientPrisma = new DaoClientPrisma(this.prisma)
  public daoClient = this.utiliseMemoire ? this.daoClientMemoire : this.daoClientPrisma
  public daoDocumentMemoire = new DaoDocumentMemoire()
  public daoDocumentPrisma = new DaoDocumentPrisma(this.prisma)
  public daoDocument = this.utiliseMemoire ? this.daoDocumentMemoire : this.daoDocumentPrisma
  public daoTransactionPaiementMemoire = new DaoTransactionPaiementMemoire()
  public daoTransactionPaiementPrisma = new DaoTransactionPaiementPrisma(this.prisma)
  public daoTransactionPaiement =
    this.utiliseMemoire ? this.daoTransactionPaiementMemoire : this.daoTransactionPaiementPrisma
  public daoPaiementCautionMemoire = new DaoPaiementCautionMemoire()
  public daoPaiementCautionPrisma = new DaoPaiementCautionPrisma(this.prisma)
  public daoPaiementCaution =
    this.utiliseMemoire ? this.daoPaiementCautionMemoire : this.daoPaiementCautionPrisma
  public daoItemTravailMemoire = new DaoItemTravailMemoire()
  public daoItemTravailPrisma = new DaoItemTravailPrisma(this.prisma)
  public daoItemTravail = this.utiliseMemoire ? this.daoItemTravailMemoire : this.daoItemTravailPrisma
  public daoExecutionImportMemoire = new DaoExecutionImportMemoire()
  public daoExecutionImportPrisma = new DaoExecutionImportPrisma(this.prisma)
  public daoExecutionImport =
    this.utiliseMemoire ? this.daoExecutionImportMemoire : this.daoExecutionImportPrisma
  public daoNotificationMemoire = new DaoNotificationMemoire()
  public daoNotificationPrisma = new DaoNotificationPrisma(this.prisma)
  public daoNotification = this.utiliseMemoire ? this.daoNotificationMemoire : this.daoNotificationPrisma
  public daoIpBloqueeMemoire = new DaoIpBloqueeMemoire()
  public daoIpBloqueePrisma = new DaoIpBloqueePrisma(this.prisma)
  public daoIpBloquee = this.utiliseMemoire ? this.daoIpBloqueeMemoire : this.daoIpBloqueePrisma
  public daoJournalAuditMemoire = new DaoJournalAuditMemoire()
  public daoJournalAuditPrisma = new DaoJournalAuditPrisma(this.prisma)
  public daoJournalAudit = this.utiliseMemoire ? this.daoJournalAuditMemoire : this.daoJournalAuditPrisma
  public daoPaiementAbonnementAdminMemoire = new DaoPaiementAbonnementAdminMemoire()
  public daoPaiementAbonnementAdminPrisma = new DaoPaiementAbonnementAdminPrisma(this.prisma)
  public daoPaiementAbonnementAdmin =
    this.utiliseMemoire
      ? this.daoPaiementAbonnementAdminMemoire
      : this.daoPaiementAbonnementAdminPrisma
  public daoStatutAbonnementAdminMemoire = new DaoStatutAbonnementAdminMemoire()
  public daoStatutAbonnementAdminPrisma = new DaoStatutAbonnementAdminPrisma(this.prisma)
  public daoStatutAbonnementAdmin =
    this.utiliseMemoire
      ? this.daoStatutAbonnementAdminMemoire
      : this.daoStatutAbonnementAdminPrisma
  public daoParametreAdminPrisma = new DaoParametreAdminPrisma(this.prisma)
  public serviceAdministrationAdmin = new ServiceAdministrationAdmin({
    serviceAuthentification: this.serviceAuthentification,
    daoClient: this.daoClient,
    daoDocument: this.daoDocument,
    daoTransactionPaiement: this.daoTransactionPaiement,
    daoPaiementCaution: this.daoPaiementCaution,
    daoItemTravail: this.daoItemTravail,
    daoExecutionImport: this.daoExecutionImport,
    daoNotification: this.daoNotification,
    daoIpBloquee: this.daoIpBloquee,
    daoJournalAudit: this.daoJournalAudit,
    daoPaiementAbonnementAdmin: this.daoPaiementAbonnementAdmin,
    daoStatutAbonnementAdmin: this.daoStatutAbonnementAdmin,
    daoParametreAdmin: this.utiliseMemoire ? undefined : this.daoParametreAdminPrisma,
  })
  public serviceAdministrationAdminSupervision = creerServiceAdministrationAdminSupervision({
    utiliseMemoire: this.utiliseMemoire,
    prisma: this.prisma,
    serviceAuthentification: this.serviceAuthentification,
    serviceHachageMotDePasse: this.serviceHachageMotDePasse,
    serviceAlerteSuperAdminWebhook: this.serviceAlerteSuperAdminWebhook,
  })
  public controleurAdministrationAdmin = new ControleurAdministrationAdmin(
    this.serviceAdministrationAdmin,
    this.serviceAdministrationAdminSupervision
  )
  public serviceSante = new ServiceSante(this.clientBaseDeDonnees, this.configurationApplication)
  public controleurSante = new ControleurSante(this.serviceSante, this.validateurEntree)
}

export const conteneurDependances = new ConteneurDependances()
