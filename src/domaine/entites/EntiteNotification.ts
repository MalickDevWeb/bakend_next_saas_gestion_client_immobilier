import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
export class EntiteNotification extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public readonly utilisateurId: string,
    public message: string,
    public type?: string,
    public estLue = false,
    public readonly creeLe: Date = new Date()
  ) {
    super()
  }

  public marquerCommeLue(): void {
    this.estLue = true
  }
}
