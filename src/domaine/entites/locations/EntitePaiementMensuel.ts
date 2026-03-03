import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntiteTransactionPaiement } from '@/src/domaine/entites/locations/EntiteTransactionPaiement'
import { ObjetValeurIdentifiant, ObjetValeurMontant } from '@/src/domaine/objets_valeur'
import { TypeStatutPaiementMensuel } from '@/src/domaine/types/locations/TypeStatutPaiementMensuel'

export class EntitePaiementMensuel extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public readonly locationId: string,
    public periodeDebut: Date,
    public periodeFin: Date,
    public dateEcheance: Date,
    public montantDu: number,
    public montantPaye = 0,
    public statut: TypeStatutPaiementMensuel = 'unpaid',
    public transactions: EntiteTransactionPaiement[] = []
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    new ObjetValeurIdentifiant(locationId)
    this.montantDu = new ObjetValeurMontant(montantDu).valeur
    this.montantPaye = new ObjetValeurMontant(montantPaye).valeur
    if (this.montantPaye > this.montantDu) {
      throw new Error('montantPaye ne peut pas depasser montantDu')
    }
    if (this.periodeFin.getTime() < this.periodeDebut.getTime()) {
      throw new Error('periodeFin invalide: anterieure a periodeDebut')
    }
  }

  public montantRestant(): number {
    return Math.max(this.montantDu - this.montantPaye, 0)
  }

  public estSolde(): boolean {
    return this.montantPaye >= this.montantDu
  }

  public estEnRetard(dateReference: Date = new Date()): boolean {
    return !this.estSolde() && this.dateEcheance.getTime() < dateReference.getTime()
  }

  public ajouterTransaction(transaction: EntiteTransactionPaiement): void {
    this.transactions.push(transaction)
    this.montantPaye = new ObjetValeurMontant(this.montantPaye + transaction.montant).valeur

    if (this.estSolde()) {
      this.statut = 'paid'
      return
    }

    this.statut = this.montantPaye > 0 ? 'partial' : 'unpaid'
  }
}
