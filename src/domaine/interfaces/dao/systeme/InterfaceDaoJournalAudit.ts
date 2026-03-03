import { EntiteJournalAudit } from '@/src/domaine/entites/systeme/EntiteJournalAudit'

export interface InterfaceDaoJournalAudit {
  lister(): Promise<EntiteJournalAudit[]>
  rechercherParId(id: string): Promise<EntiteJournalAudit | null>
  sauvegarder(entite: EntiteJournalAudit): Promise<EntiteJournalAudit>
  supprimerParId(id: string): Promise<void>
}
