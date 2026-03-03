import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import {
  ObjetValeurIdentifiant,
  ObjetValeurTexteNonVide,
  ObjetValeurUrlHttpOuChemin,
} from '@/src/domaine/objets_valeur'
import { TypeDocument } from '@/src/domaine/types/locations/TypeDocument'

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
    new ObjetValeurIdentifiant(id)
    this.nom = new ObjetValeurTexteNonVide(nom, 'nom', 255).valeur
    this.url = new ObjetValeurUrlHttpOuChemin(url).valeur
  }

  public marquerCommeSigne(): void {
    this.estSigne = true
  }
}
