import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { ObjetValeurTexteNonVide } from '@/src/domaine/objets_valeur'

export class EntitePermissionUtilisateurAuth extends ObjetDomaine {
  public readonly code: string
  public readonly autorise: boolean

  constructor(code: string, autorise: boolean = true) {
    super()
    this.code = new ObjetValeurTexteNonVide(code, 'codePermission', 120).valeur.toUpperCase()
    this.autorise = Boolean(autorise)
  }
}
