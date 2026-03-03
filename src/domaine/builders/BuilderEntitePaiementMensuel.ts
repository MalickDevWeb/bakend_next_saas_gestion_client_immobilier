import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntitePaiementMensuel } from '@/src/domaine/entites/EntitePaiementMensuel'
import { EntiteTransactionPaiement } from '@/src/domaine/entites/EntiteTransactionPaiement'
import { TypeStatutPaiementMensuel } from '@/src/domaine/types/TypeStatutPaiementMensuel'

export class BuilderEntitePaiementMensuel extends BuilderAbstrait<EntitePaiementMensuel> {
  private id?: string
  private locationId?: string
  private periodeDebut?: Date
  private periodeFin?: Date
  private dateEcheance?: Date
  private montantDu = 0
  private montantPaye = 0
  private statut: TypeStatutPaiementMensuel = 'unpaid'
  private transactions: EntiteTransactionPaiement[] = []

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecLocationId(valeur: string): this { this.locationId = valeur; return this }
  public avecPeriodeDebut(valeur: Date): this { this.periodeDebut = valeur; return this }
  public avecPeriodeFin(valeur: Date): this { this.periodeFin = valeur; return this }
  public avecDateEcheance(valeur: Date): this { this.dateEcheance = valeur; return this }
  public avecMontantDu(valeur: number): this { this.montantDu = valeur; return this }
  public avecMontantPaye(valeur: number): this { this.montantPaye = valeur; return this }
  public avecStatut(valeur: TypeStatutPaiementMensuel): this { this.statut = valeur; return this }
  public avecTransactions(valeur: EntiteTransactionPaiement[]): this { this.transactions = valeur; return this }

  public construire(): EntitePaiementMensuel {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const locationId = this.exigerIdentifiant(this.locationId, 'locationId')
    const periodeDebut = this.dateOuMaintenant(this.periodeDebut)
    const periodeFin = this.dateOuMaintenant(this.periodeFin)
    const dateEcheance = this.dateOuMaintenant(this.dateEcheance)
    const montantDu = this.montantNonNegatif(this.montantDu, 'montantDu')
    const montantPaye = this.montantNonNegatif(this.montantPaye, 'montantPaye')
    if (montantPaye > montantDu) {
      throw new Error('montantPaye ne peut pas depasser montantDu')
    }

    return new EntitePaiementMensuel(
      id,
      locationId,
      periodeDebut,
      periodeFin,
      dateEcheance,
      montantDu,
      montantPaye,
      this.statut,
      this.transactions
    )
  }
}
