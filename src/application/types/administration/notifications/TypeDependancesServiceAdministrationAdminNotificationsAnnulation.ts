import type { MappeurAdministrationAdmin } from '@/src/application/mappers'
import type { ServiceAdministrationAdminConstructeursSysteme } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursSysteme'
import type { InterfaceDaoNotification } from '@/src/domaine/interfaces/dao'
import type { TypeDependancesAdministrationCommunes } from '@/src/application/types/administration/commun/TypeDependancesAdministrationCommunes'

export type TypeDependancesServiceAdministrationAdminNotificationsAnnulation =
  TypeDependancesAdministrationCommunes & {
    daoNotification: InterfaceDaoNotification
    constructeur: ServiceAdministrationAdminConstructeursSysteme
    mappeur: MappeurAdministrationAdmin
  }
