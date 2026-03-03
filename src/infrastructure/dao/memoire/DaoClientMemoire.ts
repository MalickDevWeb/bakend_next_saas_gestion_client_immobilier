import { EntiteClient } from '@/src/domaine/entites/EntiteClient'
import { InterfaceDaoClient } from '@/src/domaine/interfaces/dao/InterfaceDaoClient'

export class DaoClientMemoire implements InterfaceDaoClient {
  private readonly elements = new Map<string, EntiteClient>()

  public async lister(): Promise<EntiteClient[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteClient | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteClient): Promise<EntiteClient> {
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
