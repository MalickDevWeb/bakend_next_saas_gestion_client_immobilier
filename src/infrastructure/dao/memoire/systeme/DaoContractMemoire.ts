import { EntiteContract } from '@/src/domaine/entites/contrats/EntiteContract'
import { InterfaceDaoContract } from '@/src/domaine/interfaces/dao/contrats/InterfaceDaoContract'

export class DaoContractMemoire implements InterfaceDaoContract {
  private store = new Map<string, EntiteContract>()

  public async listerParAdmin(adminId: string): Promise<EntiteContract[]> {
    return Array.from(this.store.values()).filter((c) => c.adminId === adminId)
  }

  public async listerParClient(adminId: string, clientId: string): Promise<EntiteContract[]> {
    return Array.from(this.store.values()).filter((c) => c.adminId === adminId && c.clientId === clientId)
  }

  public async rechercherParId(id: string): Promise<EntiteContract | null> {
    return this.store.get(id) || null
  }

  public async sauvegarder(entite: EntiteContract): Promise<EntiteContract> {
    this.store.set(entite.id, entite)
    return entite
  }

  public async supprimerParId(id: string): Promise<void> {
    this.store.delete(id)
  }
}
