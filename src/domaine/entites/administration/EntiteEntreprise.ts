import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { ObjetValeurIdentifiant, ObjetValeurTexteNonVide } from '@/src/domaine/objets_valeur'
export class EntiteEntreprise extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public nom: string,
    public adminId?: string,
    public readonly creeLe: Date = new Date()
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    this.nom = new ObjetValeurTexteNonVide(nom, 'nom', 180).valeur
    if (adminId) new ObjetValeurIdentifiant(adminId)
  }
}
