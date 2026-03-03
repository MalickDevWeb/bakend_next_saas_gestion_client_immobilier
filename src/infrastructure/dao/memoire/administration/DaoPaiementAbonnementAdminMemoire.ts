import { EntitePaiementAbonnementAdmin } from '@/src/domaine/entites/administration/EntitePaiementAbonnementAdmin'
import { InterfaceDaoPaiementAbonnementAdmin } from '@/src/domaine/interfaces/dao/administration/InterfaceDaoPaiementAbonnementAdmin'

export class DaoPaiementAbonnementAdminMemoire implements InterfaceDaoPaiementAbonnementAdmin {
  private readonly elements = new Map<string, EntitePaiementAbonnementAdmin>()

  public async lister(): Promise<EntitePaiementAbonnementAdmin[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntitePaiementAbonnementAdmin | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntitePaiementAbonnementAdmin): Promise<EntitePaiementAbonnementAdmin> {
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
