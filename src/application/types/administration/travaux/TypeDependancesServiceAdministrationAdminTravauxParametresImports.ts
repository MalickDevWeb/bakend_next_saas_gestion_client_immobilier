import type { MappeurAdministrationAdmin } from '@/src/application/mappers'
import type { ServiceAdministrationAdminConstructeursSysteme } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursSysteme'
import type { InterfaceDaoExecutionImport, InterfaceDaoItemTravail, InterfaceDaoParametreAdmin } from '@/src/domaine/interfaces/dao'
import type { TypeDependancesAdministrationCommunes } from '@/src/application/types/administration/commun/TypeDependancesAdministrationCommunes'

export type TypeDependancesServiceAdministrationAdminTravauxParametresImports =
  TypeDependancesAdministrationCommunes & {
    daoItemTravail: InterfaceDaoItemTravail
    daoExecutionImport: InterfaceDaoExecutionImport
    daoParametreAdmin?: InterfaceDaoParametreAdmin
    constructeur: ServiceAdministrationAdminConstructeursSysteme
    mappeur: MappeurAdministrationAdmin
  }
