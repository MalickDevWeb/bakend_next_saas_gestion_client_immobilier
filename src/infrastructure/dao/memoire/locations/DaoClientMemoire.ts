import { EntiteClient } from '@/src/domaine/entites/locations/EntiteClient'
import { InterfaceDaoClient } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoClient'

export class DaoClientMemoire implements InterfaceDaoClient {
  private readonly elements = new Map<string, EntiteClient>()

  public async lister(adminId?: string): Promise<EntiteClient[]> {
    const elements = Array.from(this.elements.values())
    if (!adminId) {
      return elements
    }

    const adminIdNormalise = String(adminId || '').trim()
    return elements.filter(
      (element) => String(element.adminId || '').trim() === adminIdNormalise
    )
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
