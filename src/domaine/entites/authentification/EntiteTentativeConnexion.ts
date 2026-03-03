import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import {
  ObjetValeurAdresseIp,
  ObjetValeurIdentifiant,
  ObjetValeurIdentifiantConnexion,
} from '@/src/domaine/objets_valeur'
import { TypeTentativeConnexionAuthentification } from '@/src/domaine/types/authentification/TypeTentativeConnexionAuthentification'

export class EntiteTentativeConnexion extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public readonly identifiant: string,
    public readonly adresseIp: string,
    public readonly type: TypeTentativeConnexionAuthentification,
    public readonly succes: boolean,
    public readonly creeLe: Date,
    public readonly utilisateurId: string | null
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    new ObjetValeurIdentifiantConnexion(identifiant)
    new ObjetValeurAdresseIp(adresseIp)
    if (utilisateurId) {
      new ObjetValeurIdentifiant(utilisateurId)
    }
  }

  public estEchec(): boolean {
    return !this.succes
  }
}
