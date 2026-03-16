import { EntiteContractTemplate } from '@/src/domaine/entites/contrats/EntiteContractTemplate'
import { InterfaceDaoContractTemplate } from '@/src/domaine/interfaces/dao/contrats/InterfaceDaoContractTemplate'

export class DaoContractTemplateMemoire implements InterfaceDaoContractTemplate {
  private store = new Map<string, EntiteContractTemplate>()

  public async listerParAdmin(adminId: string): Promise<EntiteContractTemplate[]> {
    return Array.from(this.store.values()).filter((t) => t.adminId === adminId)
  }

  public async rechercherParId(id: string): Promise<EntiteContractTemplate | null> {
    return this.store.get(id) || null
  }

  public async sauvegarder(entite: EntiteContractTemplate): Promise<EntiteContractTemplate> {
    this.store.set(entite.id, entite)
    return entite
  }

  public async supprimerParId(id: string): Promise<void> {
    this.store.delete(id)
  }
}
