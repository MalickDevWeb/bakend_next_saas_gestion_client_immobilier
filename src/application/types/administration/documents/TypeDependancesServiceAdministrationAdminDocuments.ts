import type { MappeurAdministrationAdmin } from '@/src/application/mappers'
import type { ServiceAdministrationAdminConstructeursLocations } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursLocations'
import type { InterfaceDaoDocument } from '@/src/domaine/interfaces/dao'
import type { TypeDependancesAdministrationCommunes } from '@/src/application/types/administration/commun/TypeDependancesAdministrationCommunes'

export type TypeDependancesServiceAdministrationAdminDocuments =
  TypeDependancesAdministrationCommunes & {
    daoDocument: InterfaceDaoDocument
    constructeur: ServiceAdministrationAdminConstructeursLocations
    mappeur: MappeurAdministrationAdmin
  }
