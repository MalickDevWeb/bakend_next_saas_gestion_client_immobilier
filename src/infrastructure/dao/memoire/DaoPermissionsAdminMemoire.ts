import { EntitePermissionsAdmin } from '@/src/domaine/entites/EntitePermissionsAdmin'
import { InterfaceDaoPermissionsAdmin } from '@/src/domaine/interfaces/dao/InterfaceDaoPermissionsAdmin'

export class DaoPermissionsAdminMemoire implements InterfaceDaoPermissionsAdmin {
  private readonly elements = new Map<string, EntitePermissionsAdmin>()

  public async lister(): Promise<EntitePermissionsAdmin[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntitePermissionsAdmin | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntitePermissionsAdmin): Promise<EntitePermissionsAdmin> {
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
