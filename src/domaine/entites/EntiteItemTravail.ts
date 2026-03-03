import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { TypePrioriteTravail } from '@/src/domaine/types/TypePrioriteTravail'
import { TypeStatutTravail } from '@/src/domaine/types/TypeStatutTravail'

export class EntiteItemTravail extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public titre: string,
    public description: string,
    public priorite: TypePrioriteTravail = 'medium',
    public statut: TypeStatutTravail = 'pending',
    public readonly creeLe: Date = new Date(),
    public dateEcheance?: Date,
    public detecteAutomatiquement = false
  ) {
    super()
  }

  public marquerCommeComplete(): void {
    this.statut = 'completed'
  }

  public basculerStatut(): void {
    this.statut = this.statut === 'completed' ? 'pending' : 'completed'
  }
}
