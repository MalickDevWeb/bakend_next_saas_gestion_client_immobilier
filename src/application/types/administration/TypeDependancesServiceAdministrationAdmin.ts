import type { ServiceAuthentification } from '@/src/application/services/authentification/ServiceAuthentification'
import type {
  InterfaceDaoClient,
  InterfaceDaoDocument,
  InterfaceDaoExecutionImport,
  InterfaceDaoIpBloquee,
  InterfaceDaoItemTravail,
  InterfaceDaoJournalAudit,
  InterfaceDaoNotification,
  InterfaceDaoParametreAdmin,
  InterfaceDaoPaiementAbonnementAdmin,
  InterfaceDaoPaiementCaution,
  InterfaceDaoStatutAbonnementAdmin,
  InterfaceDaoTransactionPaiement,
  InterfaceDaoLocation,
  InterfaceDaoContract,
  InterfaceDaoContractTemplate,
  InterfaceDaoInventoryTemplate,
} from '@/src/domaine/interfaces/dao'

export type TypeDependancesServiceAdministrationAdmin = {
  serviceAuthentification: ServiceAuthentification
  daoClient: InterfaceDaoClient
  daoDocument: InterfaceDaoDocument
  daoTransactionPaiement: InterfaceDaoTransactionPaiement
  daoLocation: InterfaceDaoLocation
  daoPaiementCaution: InterfaceDaoPaiementCaution
  daoItemTravail: InterfaceDaoItemTravail
  daoExecutionImport: InterfaceDaoExecutionImport
  daoNotification: InterfaceDaoNotification
  daoIpBloquee: InterfaceDaoIpBloquee
  daoJournalAudit: InterfaceDaoJournalAudit
  daoPaiementAbonnementAdmin: InterfaceDaoPaiementAbonnementAdmin
  daoStatutAbonnementAdmin: InterfaceDaoStatutAbonnementAdmin
  daoParametreAdmin?: InterfaceDaoParametreAdmin
  daoContract: InterfaceDaoContract
  daoContractTemplate: InterfaceDaoContractTemplate
  daoInventoryTemplate: InterfaceDaoInventoryTemplate
}
