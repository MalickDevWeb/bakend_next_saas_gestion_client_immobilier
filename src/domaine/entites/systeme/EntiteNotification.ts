import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { ObjetValeurIdentifiant, ObjetValeurTexteNonVide } from '@/src/domaine/objets_valeur'
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
    new ObjetValeurIdentifiant(id)
    new ObjetValeurIdentifiant(utilisateurId)
    this.message = new ObjetValeurTexteNonVide(message, 'message', 2000).valeur
    if (type) {
      this.type = new ObjetValeurTexteNonVide(type, 'type', 80).valeur
    }
  }

  public marquerCommeLue(): void {
    this.estLue = true
  }
}
