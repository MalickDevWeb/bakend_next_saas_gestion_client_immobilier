import type { MappeurAdministrationAdmin } from '@/src/application/mappers'
import type { ServiceAdministrationAdminConstructeursSysteme } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursSysteme'
import type { InterfaceDaoPaiementAbonnementAdmin, InterfaceDaoStatutAbonnementAdmin } from '@/src/domaine/interfaces/dao'
import type { TypeDependancesAdministrationCommunes } from '@/src/application/types/administration/commun/TypeDependancesAdministrationCommunes'

export type TypeDependancesServiceAdministrationAdminPaiementsAdmin =
  TypeDependancesAdministrationCommunes & {
    daoPaiementAbonnementAdmin: InterfaceDaoPaiementAbonnementAdmin
    daoStatutAbonnementAdmin: InterfaceDaoStatutAbonnementAdmin
    constructeur: ServiceAdministrationAdminConstructeursSysteme
    mappeur: MappeurAdministrationAdmin
  }
