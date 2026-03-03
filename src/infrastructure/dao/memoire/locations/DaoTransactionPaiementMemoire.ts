import { EntiteTransactionPaiement } from '@/src/domaine/entites/locations/EntiteTransactionPaiement'
import { InterfaceDaoTransactionPaiement } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoTransactionPaiement'

export class DaoTransactionPaiementMemoire implements InterfaceDaoTransactionPaiement {
  private readonly elements = new Map<string, EntiteTransactionPaiement>()

  public async lister(): Promise<EntiteTransactionPaiement[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteTransactionPaiement | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteTransactionPaiement): Promise<EntiteTransactionPaiement> {
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
