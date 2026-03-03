import { EntiteDemandeAdmin } from '@/src/domaine/entites/administration/EntiteDemandeAdmin'
import { InterfaceDaoDemandeAdmin } from '@/src/domaine/interfaces/dao/administration/InterfaceDaoDemandeAdmin'

export class DaoDemandeAdminMemoire implements InterfaceDaoDemandeAdmin {
  private readonly elements = new Map<string, EntiteDemandeAdmin>()

  public async lister(): Promise<EntiteDemandeAdmin[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteDemandeAdmin | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteDemandeAdmin): Promise<EntiteDemandeAdmin> {
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
