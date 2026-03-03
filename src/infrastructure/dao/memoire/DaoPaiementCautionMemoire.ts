import { EntitePaiementCaution } from '@/src/domaine/entites/EntitePaiementCaution'
import { InterfaceDaoPaiementCaution } from '@/src/domaine/interfaces/dao/InterfaceDaoPaiementCaution'

export class DaoPaiementCautionMemoire implements InterfaceDaoPaiementCaution {
  private readonly elements = new Map<string, EntitePaiementCaution>()

  public async lister(): Promise<EntitePaiementCaution[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntitePaiementCaution | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntitePaiementCaution): Promise<EntitePaiementCaution> {
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
