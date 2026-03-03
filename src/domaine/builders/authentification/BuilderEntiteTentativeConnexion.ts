import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteTentativeConnexion } from '@/src/domaine/entites/authentification/EntiteTentativeConnexion'
import {
  ObjetValeurAdresseIp,
  ObjetValeurIdentifiantConnexion,
} from '@/src/domaine/objets_valeur'
import {
  TypeTentativeConnexionAuthentification,
  VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION,
} from '@/src/domaine/types/authentification/TypeTentativeConnexionAuthentification'

export class BuilderEntiteTentativeConnexion extends BuilderAbstrait<EntiteTentativeConnexion> {
  private id?: string
  private identifiant?: string
  private adresseIp?: string
  private type?: TypeTentativeConnexionAuthentification
  private succes = false
  private creeLe?: Date
  private utilisateurId: string | null = null

  public avecId(valeur: string): this {
    this.id = valeur
    return this
  }

  public avecIdentifiant(valeur: string): this {
    this.identifiant = valeur
    return this
  }

  public avecAdresseIp(valeur: string): this {
    this.adresseIp = valeur
    return this
  }

  public avecType(valeur: TypeTentativeConnexionAuthentification): this {
    this.type = valeur
    return this
  }

  public avecSucces(valeur: boolean): this {
    this.succes = valeur
    return this
  }

  public avecDateCreation(valeur: Date): this {
    this.creeLe = valeur
    return this
  }

  public avecUtilisateurId(valeur: string | null): this {
    this.utilisateurId = valeur
    return this
  }

  public construire(): EntiteTentativeConnexion {
    if (!this.type) {
      throw new Error('type est obligatoire')
    }
    const type = this.type
    if (!Object.values(VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION).includes(type)) {
      throw new Error('Type tentative connexion invalide')
    }

    return new EntiteTentativeConnexion(
      this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID(),
      new ObjetValeurIdentifiantConnexion(this.exiger(this.identifiant, 'identifiant')).valeur,
      new ObjetValeurAdresseIp(this.exiger(this.adresseIp, 'adresseIp')).valeur,
      type,
      Boolean(this.succes),
      this.dateOuMaintenant(this.creeLe),
      this.utilisateurId ? this.exigerIdentifiant(this.utilisateurId, 'utilisateurId') : null
    )
  }
}
