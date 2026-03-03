import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import {
  ObjetValeurAdresseIp,
  ObjetValeurIdentifiant,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'
export class EntiteJournalAudit extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public acteur?: string,
    public action?: string,
    public typeCible?: string,
    public idCible?: string,
    public message?: string,
    public adresseIp?: string,
    public readonly creeLe: Date = new Date()
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    if (acteur) this.acteur = new ObjetValeurTexteNonVide(acteur, 'acteur', 150).valeur
    if (action) this.action = new ObjetValeurTexteNonVide(action, 'action', 150).valeur
    if (typeCible) this.typeCible = new ObjetValeurTexteNonVide(typeCible, 'typeCible', 120).valeur
    if (idCible) this.idCible = new ObjetValeurTexteNonVide(idCible, 'idCible', 120).valeur
    if (message) this.message = new ObjetValeurTexteNonVide(message, 'message', 2000).valeur
    if (adresseIp) this.adresseIp = new ObjetValeurAdresseIp(adresseIp).valeur
  }
}
