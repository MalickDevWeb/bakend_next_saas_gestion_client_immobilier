import type { MappeurAdministrationAdmin } from '@/src/application/mappers'
import type { ServiceAdministrationAdminConstructeursSysteme } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursSysteme'
import type { InterfaceDaoIpBloquee, InterfaceDaoJournalAudit } from '@/src/domaine/interfaces/dao'
import type { TypeDependancesAdministrationCommunes } from '@/src/application/types/administration/commun/TypeDependancesAdministrationCommunes'

export type TypeDependancesServiceAdministrationAdminAuditIpsCloudinary =
  TypeDependancesAdministrationCommunes & {
    daoJournalAudit: InterfaceDaoJournalAudit
    daoIpBloquee: InterfaceDaoIpBloquee
    constructeur: ServiceAdministrationAdminConstructeursSysteme
    mappeur: MappeurAdministrationAdmin
  }
