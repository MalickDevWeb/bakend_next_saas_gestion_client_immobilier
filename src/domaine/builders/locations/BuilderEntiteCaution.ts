import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteCaution } from '@/src/domaine/entites/locations/EntiteCaution'
import { EntitePaiementCaution } from '@/src/domaine/entites/locations/EntitePaiementCaution'

export class BuilderEntiteCaution extends BuilderAbstrait<EntiteCaution> {
  private montantTotal = 0
  private montantPaye = 0
  private paiements: EntitePaiementCaution[] = []

  public avecMontantTotal(valeur: number): this { this.montantTotal = valeur; return this }
  public avecMontantPaye(valeur: number): this { this.montantPaye = valeur; return this }
  public avecPaiements(valeur: EntitePaiementCaution[]): this { this.paiements = valeur; return this }

  public construire(): EntiteCaution {
    const montantTotal = this.montantNonNegatif(this.montantTotal, 'montantTotal')
    const montantPaye = this.montantNonNegatif(this.montantPaye, 'montantPaye')
    if (montantPaye > montantTotal) {
      throw new Error('montantPaye ne peut pas depasser montantTotal')
    }
    return new EntiteCaution(montantTotal, montantPaye, this.paiements)
  }
}
