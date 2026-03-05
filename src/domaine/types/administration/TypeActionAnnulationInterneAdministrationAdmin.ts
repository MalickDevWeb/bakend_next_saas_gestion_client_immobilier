import { TypeMetadonneesActionAnnulationAdministrationAdmin } from '@/src/domaine/types/administration/TypeMetadonneesActionAnnulationAdministrationAdmin'
import { TypeOperationAnnulationAdministrationAdmin } from '@/src/domaine/types/administration/TypeOperationAnnulationAdministrationAdmin'

export type TypeActionAnnulationInterneAdministrationAdmin = {
  metadonnees: TypeMetadonneesActionAnnulationAdministrationAdmin
  operation: TypeOperationAnnulationAdministrationAdmin
  executerRollback: () => Promise<void>
}
