import type { MappeurAdministrationAdmin } from '@/src/application/mappers'
import type { ServiceAdministrationAdminConstructeursSysteme } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursSysteme'
import type { InterfaceDaoExecutionImport } from '@/src/domaine/interfaces/dao'
import type { TypeDependancesAdministrationCommunes } from '@/src/application/types/administration/commun/TypeDependancesAdministrationCommunes'

export type TypeDependancesServiceAdministrationAdminImports =
  TypeDependancesAdministrationCommunes & {
    daoExecutionImport: InterfaceDaoExecutionImport
    constructeur: ServiceAdministrationAdminConstructeursSysteme
    mappeur: MappeurAdministrationAdmin
  }
