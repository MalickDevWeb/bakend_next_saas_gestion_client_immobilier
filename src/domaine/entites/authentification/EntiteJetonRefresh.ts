import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntiteSessionAuthentification } from '@/src/domaine/entites/authentification/EntiteSessionAuthentification'
import {
  ObjetValeurHachageJetonRefresh,
  ObjetValeurIdentifiant,
} from '@/src/domaine/objets_valeur'

export class EntiteJetonRefresh extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly hachageToken: string,
    public readonly expireLe: Date,
    public readonly utiliseLe: Date | null,
    public readonly revoqueLe: Date | null,
    public readonly remplaceParId: string | null,
    public readonly session: EntiteSessionAuthentification
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    new ObjetValeurIdentifiant(sessionId)
    new ObjetValeurHachageJetonRefresh(hachageToken)
    if (remplaceParId) {
      new ObjetValeurIdentifiant(remplaceParId)
    }
    if (remplaceParId && !utiliseLe && !revoqueLe) {
      throw new Error('Jeton refresh remplace invalide: il doit etre utilise ou revoque')
    }
    if (session.id !== sessionId) {
      throw new Error('Jeton refresh invalide: sessionId incoherent')
    }
  }

  public estUtiliseOuRevoque(): boolean {
    return Boolean(this.utiliseLe || this.revoqueLe)
  }

  public estExpire(reference: Date = new Date()): boolean {
    return this.expireLe.getTime() <= reference.getTime()
  }
}
