import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { ObjetValeurTexteNonVide } from '@/src/domaine/objets_valeur'
export class EntiteErreurImport extends ObjetDomaine {
  constructor(
    public readonly numeroLigne: number,
    public erreurs: string[],
    public donneesBrutes: Record<string, unknown>
  ) {
    super()
    if (!Number.isFinite(numeroLigne) || Math.floor(numeroLigne) <= 0) {
      throw new Error('numeroLigne invalide')
    }
    this.erreurs = erreurs
      .map((erreur) => new ObjetValeurTexteNonVide(String(erreur || ''), 'erreurImport', 500).valeur)
      .filter(Boolean)
    this.donneesBrutes = donneesBrutes && typeof donneesBrutes === 'object' ? donneesBrutes : {}
  }
}
