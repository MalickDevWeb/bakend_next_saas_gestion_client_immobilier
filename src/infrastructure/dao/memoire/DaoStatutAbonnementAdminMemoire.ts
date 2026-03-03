import { EntiteStatutAbonnementAdmin } from '@/src/domaine/entites/EntiteStatutAbonnementAdmin'
import { InterfaceDaoStatutAbonnementAdmin } from '@/src/domaine/interfaces/dao/InterfaceDaoStatutAbonnementAdmin'

export class DaoStatutAbonnementAdminMemoire implements InterfaceDaoStatutAbonnementAdmin {
  private readonly elements = new Map<string, EntiteStatutAbonnementAdmin>()

  public async lister(): Promise<EntiteStatutAbonnementAdmin[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteStatutAbonnementAdmin | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteStatutAbonnementAdmin): Promise<EntiteStatutAbonnementAdmin> {
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
