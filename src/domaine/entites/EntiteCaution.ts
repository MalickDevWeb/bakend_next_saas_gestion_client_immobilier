import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntitePaiementCaution } from '@/src/domaine/entites/EntitePaiementCaution'

export class EntiteCaution extends ObjetDomaine {
  constructor(
    public montantTotal: number,
    public montantPaye = 0,
    public paiements: EntitePaiementCaution[] = []
  ) {
    super()
  }

  public montantRestant(): number {
    return Math.max(this.montantTotal - this.montantPaye, 0)
  }

  public estSoldee(): boolean {
    return this.montantRestant() <= 0
  }

  public ajouterPaiement(paiement: EntitePaiementCaution): void {
    this.paiements.push(paiement)
    this.montantPaye += paiement.montant
  }
}
