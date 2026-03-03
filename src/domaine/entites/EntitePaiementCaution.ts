import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
export class EntitePaiementCaution extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public montant: number,
    public datePaiement: Date,
    public numeroRecu: string,
    public note?: string
  ) {
    super()
  }

  public estValide(): boolean {
    return this.montant > 0 && this.numeroRecu.trim().length > 0
  }
}
