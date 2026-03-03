import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteJetonRefresh } from '@/src/domaine/entites/authentification/EntiteJetonRefresh'
import { EntiteSessionAuthentification } from '@/src/domaine/entites/authentification/EntiteSessionAuthentification'
import { ObjetValeurHachageJetonRefresh } from '@/src/domaine/objets_valeur'

export class BuilderEntiteJetonRefresh extends BuilderAbstrait<EntiteJetonRefresh> {
  private id?: string
  private sessionId?: string
  private hachageToken?: string
  private expireLe?: Date
  private utiliseLe: Date | null = null
  private revoqueLe: Date | null = null
  private remplaceParId: string | null = null
  private session?: EntiteSessionAuthentification

  public avecId(valeur: string): this {
    this.id = valeur
    return this
  }

  public avecSessionId(valeur: string): this {
    this.sessionId = valeur
    return this
  }

  public avecHachageToken(valeur: string): this {
    this.hachageToken = valeur
    return this
  }

  public avecExpireLe(valeur: Date): this {
    this.expireLe = valeur
    return this
  }

  public avecUtiliseLe(valeur: Date | null): this {
    this.utiliseLe = valeur
    return this
  }

  public avecRevoqueLe(valeur: Date | null): this {
    this.revoqueLe = valeur
    return this
  }

  public avecRemplaceParId(valeur: string | null): this {
    this.remplaceParId = valeur
    return this
  }

  public avecSession(valeur: EntiteSessionAuthentification): this {
    this.session = valeur
    return this
  }

  public construire(): EntiteJetonRefresh {
    if (!this.session) {
      throw new Error('session est obligatoire')
    }
    const session = this.session
    const sessionId = this.exigerIdentifiant(this.sessionId || session.id, 'sessionId')

    if (this.remplaceParId && !this.utiliseLe && !this.revoqueLe) {
      throw new Error('Un jeton remplace doit etre revoque ou marque utilise')
    }

    return new EntiteJetonRefresh(
      this.exigerIdentifiant(this.id, 'id'),
      sessionId,
      new ObjetValeurHachageJetonRefresh(this.exiger(this.hachageToken, 'hachageToken')).valeur,
      this.dateOuMaintenant(this.expireLe),
      this.utiliseLe,
      this.revoqueLe,
      this.remplaceParId ? this.exigerIdentifiant(this.remplaceParId, 'remplaceParId') : null,
      session
    )
  }
}
