import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { TypeDocument } from '@/src/domaine/types/TypeDocument'

export class EntiteDocument extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public nom: string,
    public type: TypeDocument,
    public url: string,
    public dateAjout: Date,
    public estSigne = false
  ) {
    super()
  }

  public marquerCommeSigne(): void {
    this.estSigne = true
  }
}
