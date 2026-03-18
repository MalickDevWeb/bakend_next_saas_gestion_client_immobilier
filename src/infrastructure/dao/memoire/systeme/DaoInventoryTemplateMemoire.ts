import { EntiteInventoryTemplate } from '@/src/domaine/entites/contrats/EntiteInventoryTemplate'
import { InterfaceDaoInventoryTemplate } from '@/src/domaine/interfaces/dao/contrats/InterfaceDaoInventoryTemplate'

export class DaoInventoryTemplateMemoire implements InterfaceDaoInventoryTemplate {
  private store = new Map<string, EntiteInventoryTemplate>()

  public async listerParAdmin(adminId: string): Promise<EntiteInventoryTemplate[]> {
    return Array.from(this.store.values()).filter((t) => t.adminId === adminId)
  }

  public async rechercherParId(id: string): Promise<EntiteInventoryTemplate | null> {
    return this.store.get(id) || null
  }

  public async sauvegarder(entite: EntiteInventoryTemplate): Promise<EntiteInventoryTemplate> {
    this.store.set(entite.id, entite)
    return entite
  }

  public async supprimerParId(id: string): Promise<void> {
    this.store.delete(id)
  }
}
