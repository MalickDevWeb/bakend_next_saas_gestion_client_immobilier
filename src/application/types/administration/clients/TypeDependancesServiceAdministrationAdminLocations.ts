import type { MappeurAdministrationAdmin } from '@/src/application/mappers'
import type { ServiceAdministrationAdminConstructeursLocations } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursLocations'
import type { InterfaceDaoClient } from '@/src/domaine/interfaces/dao'
import type { TypeStatutMouvement } from '@/src/domaine/types/administration'
import type { TypeDependancesAdministrationCommunes } from '@/src/application/types/administration/commun/TypeDependancesAdministrationCommunes'

export type TypeDependancesServiceAdministrationAdminLocations =
  TypeDependancesAdministrationCommunes & {
    daoClient: InterfaceDaoClient
    constructeur: ServiceAdministrationAdminConstructeursLocations
    mappeur: MappeurAdministrationAdmin
    statutsPaiement: Map<string, TypeStatutMouvement>
    statutsDepot: Map<string, TypeStatutMouvement>
  }
