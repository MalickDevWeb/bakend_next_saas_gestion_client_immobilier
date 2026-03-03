import { EntiteCaution } from '@/src/domaine/entites/locations/EntiteCaution'
import { InterfaceDaoCaution } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoCaution'

export class DaoCautionMemoire implements InterfaceDaoCaution {
  private readonly elements = new Map<string, EntiteCaution>()

  public async lister(): Promise<EntiteCaution[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteCaution | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteCaution): Promise<EntiteCaution> {
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
