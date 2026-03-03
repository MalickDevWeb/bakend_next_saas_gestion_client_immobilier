import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { ObjetValeurAdresseIp, ObjetValeurIdentifiant, ObjetValeurTexteNonVide } from '@/src/domaine/objets_valeur'
export class EntiteIpBloquee extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public adresseIp: string,
    public raison?: string,
    public readonly creeLe: Date = new Date()
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    this.adresseIp = new ObjetValeurAdresseIp(adresseIp).valeur
    if (raison) {
      this.raison = new ObjetValeurTexteNonVide(raison, 'raison', 300).valeur
    }
  }
}
