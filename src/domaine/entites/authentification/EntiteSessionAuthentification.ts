import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntiteUtilisateurAuthentification } from '@/src/domaine/entites/authentification/EntiteUtilisateurAuthentification'
import {
  ObjetValeurAdresseIp,
  ObjetValeurAgentUtilisateur,
  ObjetValeurIdentifiant,
  ObjetValeurJetonAccesJti,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'

export class EntiteSessionAuthentification extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public readonly utilisateur: EntiteUtilisateurAuthentification,
    public readonly jetonAccesJti: string,
    public readonly jetonAccesExpireLe: Date,
    public readonly csrfToken: string,
    public readonly adresseIp: string,
    public readonly agentUtilisateur: string,
    public readonly secondeAuthValideeLe: Date | null,
    public readonly expireLe: Date,
    public readonly revoqueeLe: Date | null,
    public readonly compromissionDetecteeLe: Date | null
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    new ObjetValeurJetonAccesJti(jetonAccesJti)
    new ObjetValeurTexteNonVide(csrfToken, 'csrfToken', 300)
    new ObjetValeurAdresseIp(adresseIp)
    new ObjetValeurAgentUtilisateur(agentUtilisateur)
    if (expireLe.getTime() < jetonAccesExpireLe.getTime()) {
      throw new Error('Session invalide: expiration session anterieure a expiration jeton acces')
    }
  }

  public estRevoqueeOuCompromise(): boolean {
    return Boolean(this.revoqueeLe || this.compromissionDetecteeLe)
  }

  public estExpiree(reference: Date = new Date()): boolean {
    return this.expireLe.getTime() <= reference.getTime()
  }

  public jetonAccesCorrespond(jti: string): boolean {
    return this.jetonAccesJti === String(jti || '').trim()
  }
}
