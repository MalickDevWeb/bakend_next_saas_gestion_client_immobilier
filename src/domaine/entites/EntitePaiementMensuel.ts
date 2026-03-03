import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntiteTransactionPaiement } from '@/src/domaine/entites/EntiteTransactionPaiement'
import { TypeStatutPaiementMensuel } from '@/src/domaine/types/TypeStatutPaiementMensuel'

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
    this.montantPaye += transaction.montant

    if (this.estSolde()) {
      this.statut = 'paid'
      return
    }

    this.statut = this.montantPaye > 0 ? 'partial' : 'unpaid'
  }
}
