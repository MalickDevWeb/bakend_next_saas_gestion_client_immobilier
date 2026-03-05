import type { TypeDependancesAdministrationCommunes } from '@/src/application/types/administration/commun/TypeDependancesAdministrationCommunes'
import type { InterfaceDaoParametreAdmin } from '@/src/domaine/interfaces/dao'

export type TypeDependancesServiceAdministrationAdminParametres =
  TypeDependancesAdministrationCommunes & {
    daoParametreAdmin?: InterfaceDaoParametreAdmin
  }
