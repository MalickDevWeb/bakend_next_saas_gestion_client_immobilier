import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteSessionAuthentification } from '@/src/domaine/entites/authentification/EntiteSessionAuthentification'
import { EntiteUtilisateurAuthentification } from '@/src/domaine/entites/authentification/EntiteUtilisateurAuthentification'
import {
  ObjetValeurAdresseIp,
  ObjetValeurAgentUtilisateur,
  ObjetValeurJetonAccesJti,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'

export class BuilderEntiteSessionAuthentification extends BuilderAbstrait<EntiteSessionAuthentification> {
  private id?: string
  private utilisateur?: EntiteUtilisateurAuthentification
  private jetonAccesJti?: string
  private jetonAccesExpireLe?: Date
  private csrfToken?: string
  private adresseIp?: string
  private agentUtilisateur?: string
  private secondeAuthValideeLe: Date | null = null
  private expireLe?: Date
  private revoqueeLe: Date | null = null
  private compromissionDetecteeLe: Date | null = null

  public avecId(valeur: string): this {
    this.id = valeur
    return this
  }

  public avecUtilisateur(valeur: EntiteUtilisateurAuthentification): this {
    this.utilisateur = valeur
    return this
  }

  public avecJetonAccesJti(valeur: string): this {
    this.jetonAccesJti = valeur
    return this
  }

  public avecJetonAccesExpireLe(valeur: Date): this {
    this.jetonAccesExpireLe = valeur
    return this
  }

  public avecCsrfToken(valeur: string): this {
    this.csrfToken = valeur
    return this
  }

  public avecAdresseIp(valeur: string): this {
    this.adresseIp = valeur
    return this
  }

  public avecAgentUtilisateur(valeur: string): this {
    this.agentUtilisateur = valeur
    return this
  }

  public avecSecondeAuthValideeLe(valeur: Date | null): this {
    this.secondeAuthValideeLe = valeur
    return this
  }

  public avecExpireLe(valeur: Date): this {
    this.expireLe = valeur
    return this
  }

  public avecRevoqueeLe(valeur: Date | null): this {
    this.revoqueeLe = valeur
    return this
  }

  public avecCompromissionDetecteeLe(valeur: Date | null): this {
    this.compromissionDetecteeLe = valeur
    return this
  }

  public construire(): EntiteSessionAuthentification {
    if (!this.utilisateur) {
      throw new Error('utilisateur est obligatoire')
    }

    const jetonAccesExpireLe = this.dateOuMaintenant(this.jetonAccesExpireLe)
    const expireLe = this.dateOuMaintenant(this.expireLe)

    if (expireLe.getTime() < jetonAccesExpireLe.getTime()) {
      throw new Error('expireLe session doit etre superieur ou egal a jetonAccesExpireLe')
    }

    return new EntiteSessionAuthentification(
      this.exigerIdentifiant(this.id, 'id'),
      this.utilisateur,
      new ObjetValeurJetonAccesJti(this.exiger(this.jetonAccesJti, 'jetonAccesJti')).valeur,
      jetonAccesExpireLe,
      new ObjetValeurTexteNonVide(this.exiger(this.csrfToken, 'csrfToken'), 'csrfToken', 300).valeur,
      new ObjetValeurAdresseIp(this.exiger(this.adresseIp, 'adresseIp')).valeur,
      new ObjetValeurAgentUtilisateur(this.exiger(this.agentUtilisateur, 'agentUtilisateur')).valeur,
      this.secondeAuthValideeLe,
      expireLe,
      this.revoqueeLe,
      this.compromissionDetecteeLe
    )
  }
}
