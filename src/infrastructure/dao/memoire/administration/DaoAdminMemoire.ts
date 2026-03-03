import { EntiteAdmin } from '@/src/domaine/entites/administration/EntiteAdmin'
import { InterfaceDaoAdmin } from '@/src/domaine/interfaces/dao/administration/InterfaceDaoAdmin'

export class DaoAdminMemoire implements InterfaceDaoAdmin {
  private readonly elements = new Map<string, EntiteAdmin>()

  public async lister(): Promise<EntiteAdmin[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteAdmin | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteAdmin): Promise<EntiteAdmin> {
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
