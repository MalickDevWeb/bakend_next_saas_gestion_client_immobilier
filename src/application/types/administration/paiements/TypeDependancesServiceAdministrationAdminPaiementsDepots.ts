import type { MappeurAdministrationAdmin } from '@/src/application/mappers'
import type { ServiceAdministrationAdminConstructeursLocations } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursLocations'
import type { ServiceAdministrationAdminConstructeursSysteme } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursSysteme'
import type { InterfaceDaoPaiementCaution, InterfaceDaoTransactionPaiement } from '@/src/domaine/interfaces/dao'
import type { TypeStatutMouvement } from '@/src/domaine/types/administration'
import type { TypeDependancesAdministrationCommunes } from '@/src/application/types/administration/commun/TypeDependancesAdministrationCommunes'

export type TypeDependancesServiceAdministrationAdminPaiementsDepots =
  TypeDependancesAdministrationCommunes & {
    daoTransactionPaiement: InterfaceDaoTransactionPaiement
    daoPaiementCaution: InterfaceDaoPaiementCaution
    constructeurLocations: ServiceAdministrationAdminConstructeursLocations
    constructeurSysteme: ServiceAdministrationAdminConstructeursSysteme
    mappeur: MappeurAdministrationAdmin
    statutsPaiement: Map<string, TypeStatutMouvement>
    statutsDepot: Map<string, TypeStatutMouvement>
  }
