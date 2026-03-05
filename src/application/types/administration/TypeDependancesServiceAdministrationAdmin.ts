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
} from '@/src/domaine/interfaces/dao'

export type TypeDependancesServiceAdministrationAdmin = {
  serviceAuthentification: ServiceAuthentification
  daoClient: InterfaceDaoClient
  daoDocument: InterfaceDaoDocument
  daoTransactionPaiement: InterfaceDaoTransactionPaiement
  daoPaiementCaution: InterfaceDaoPaiementCaution
  daoItemTravail: InterfaceDaoItemTravail
  daoExecutionImport: InterfaceDaoExecutionImport
  daoNotification: InterfaceDaoNotification
  daoIpBloquee: InterfaceDaoIpBloquee
  daoJournalAudit: InterfaceDaoJournalAudit
  daoPaiementAbonnementAdmin: InterfaceDaoPaiementAbonnementAdmin
  daoStatutAbonnementAdmin: InterfaceDaoStatutAbonnementAdmin
  daoParametreAdmin?: InterfaceDaoParametreAdmin
}
