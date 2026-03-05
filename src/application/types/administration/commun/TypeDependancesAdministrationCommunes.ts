import type { ServiceAdministrationAdminAnnulation } from '@/src/application/services/administration/commun/ServiceAdministrationAdminAnnulation'
import type { ServiceAdministrationAdminSecurite } from '@/src/application/services/administration/commun/ServiceAdministrationAdminSecurite'

export type TypeDependancesAdministrationCommunes = {
  securite: ServiceAdministrationAdminSecurite
  annulation: ServiceAdministrationAdminAnnulation
}
