import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import {
  ObjetValeurIdentifiant,
  ObjetValeurMontant,
  ObjetValeurNumeroRecu,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'
export class EntiteTransactionPaiement extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public montant: number,
    public datePaiement: Date,
    public numeroRecu: string,
    public description?: string
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    this.montant = new ObjetValeurMontant(montant).valeur
    if (this.montant <= 0) {
      throw new Error('Montant transaction invalide')
    }
    this.numeroRecu = new ObjetValeurNumeroRecu(numeroRecu).valeur
    if (description) {
      this.description = new ObjetValeurTexteNonVide(description, 'description', 1000).valeur
    }
  }

  public estValide(): boolean {
    return this.montant > 0 && this.numeroRecu.trim().length > 0
  }
}
