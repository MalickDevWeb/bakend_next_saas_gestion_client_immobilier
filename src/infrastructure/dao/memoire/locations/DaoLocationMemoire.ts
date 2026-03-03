import { EntiteLocation } from '@/src/domaine/entites/locations/EntiteLocation'
import { InterfaceDaoLocation } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoLocation'

export class DaoLocationMemoire implements InterfaceDaoLocation {
  private readonly elements = new Map<string, EntiteLocation>()

  public async lister(): Promise<EntiteLocation[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteLocation | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteLocation): Promise<EntiteLocation> {
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
