import { EntiteItemTravail } from '@/src/domaine/entites/EntiteItemTravail'
import { InterfaceDaoItemTravail } from '@/src/domaine/interfaces/dao/InterfaceDaoItemTravail'

export class DaoItemTravailMemoire implements InterfaceDaoItemTravail {
  private readonly elements = new Map<string, EntiteItemTravail>()

  public async lister(): Promise<EntiteItemTravail[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteItemTravail | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteItemTravail): Promise<EntiteItemTravail> {
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
