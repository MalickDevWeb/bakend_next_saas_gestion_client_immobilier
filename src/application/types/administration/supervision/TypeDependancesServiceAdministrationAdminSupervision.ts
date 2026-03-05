import type { MappeurAdministrationSupervision } from '@/src/application/mappers'
import type { ServiceAdministrationAdminConstructeursSupervision } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursSupervision'
import type { InterfaceServiceHachageMotDePasse } from '@/src/coeur/interfaces/InterfaceServiceHachageMotDePasse'
import type { ServiceAlerteSuperAdminWebhook } from '@/src/infrastructure/alertes/ServiceAlerteSuperAdminWebhook'
import type {
  InterfaceDaoAdmin,
  InterfaceDaoDemandeAdmin,
  InterfaceDaoEntreprise,
  InterfaceDaoUtilisateur,
} from '@/src/domaine/interfaces/dao'
import type { TypeDependancesAdministrationCommunes } from '@/src/application/types/administration/commun/TypeDependancesAdministrationCommunes'

export type TypeDependancesServiceAdministrationAdminSupervision =
  TypeDependancesAdministrationCommunes & {
    daoAdmin: InterfaceDaoAdmin
    daoDemandeAdmin: InterfaceDaoDemandeAdmin
    daoEntreprise: InterfaceDaoEntreprise
    daoUtilisateur: InterfaceDaoUtilisateur
    serviceHachageMotDePasse: InterfaceServiceHachageMotDePasse
    serviceAlerteSuperAdminWebhook: ServiceAlerteSuperAdminWebhook
    constructeur: ServiceAdministrationAdminConstructeursSupervision
    mappeur: MappeurAdministrationSupervision
  }
