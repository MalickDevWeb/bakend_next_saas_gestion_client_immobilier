import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import {
  ObjetValeurIdentifiant,
  ObjetValeurMontant,
  ObjetValeurNumeroRecu,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'
export class EntitePaiementCaution extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public montant: number,
    public datePaiement: Date,
    public numeroRecu: string,
    public note?: string
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    this.montant = new ObjetValeurMontant(montant).valeur
    if (this.montant <= 0) {
      throw new Error('Montant de paiement caution invalide')
    }
    this.numeroRecu = new ObjetValeurNumeroRecu(numeroRecu).valeur
    if (note) {
      this.note = new ObjetValeurTexteNonVide(note, 'note', 1000).valeur
    }
  }

  public estValide(): boolean {
    return this.montant > 0 && this.numeroRecu.trim().length > 0
  }
}
