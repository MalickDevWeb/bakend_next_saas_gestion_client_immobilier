import { EntiteJournalAudit } from '@/src/domaine/entites/systeme/EntiteJournalAudit'
import { InterfaceDaoJournalAudit } from '@/src/domaine/interfaces/dao/systeme/InterfaceDaoJournalAudit'

export class DaoJournalAuditMemoire implements InterfaceDaoJournalAudit {
  private readonly elements = new Map<string, EntiteJournalAudit>()

  public async lister(): Promise<EntiteJournalAudit[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteJournalAudit | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteJournalAudit): Promise<EntiteJournalAudit> {
    const identifiant = (entite as { id?: string }).id
    if (!identifiant) {
      throw new Error('Identifiant d\'entite manquant')
    }

    this.elements.set(identifiant, entite)
    return entite
  }

  public async supprimerParId(id: string): Promise<void> {
    this.elements.delete(id)
  }
}
