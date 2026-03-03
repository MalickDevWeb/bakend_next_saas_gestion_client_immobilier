import { EntiteDocument } from '@/src/domaine/entites/EntiteDocument'
import { InterfaceDaoDocument } from '@/src/domaine/interfaces/dao/InterfaceDaoDocument'

export class DaoDocumentMemoire implements InterfaceDaoDocument {
  private readonly elements = new Map<string, EntiteDocument>()

  public async lister(): Promise<EntiteDocument[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteDocument | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteDocument): Promise<EntiteDocument> {
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
