import { TypeMetadonneesActionAnnulationAdministrationAdmin } from '@/src/domaine/types/administration/TypeMetadonneesActionAnnulationAdministrationAdmin'

export type TypeResultatMutationAdministrationAdmin<T> = {
  donnees: T
  annulation: TypeMetadonneesActionAnnulationAdministrationAdmin
}
