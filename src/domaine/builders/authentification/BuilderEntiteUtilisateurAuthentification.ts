import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { BuilderEntitePermissionUtilisateurAuth } from '@/src/domaine/builders/authentification/BuilderEntitePermissionUtilisateurAuth'
import { EntitePermissionUtilisateurAuth } from '@/src/domaine/entites/authentification/EntitePermissionUtilisateurAuth'
import { EntiteUtilisateurAuthentification } from '@/src/domaine/entites/authentification/EntiteUtilisateurAuthentification'
import {
  ObjetValeurEmail,
  ObjetValeurTelephoneSenegal,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'

export class BuilderEntiteUtilisateurAuthentification extends BuilderAbstrait<EntiteUtilisateurAuthentification> {
  private id?: string
  private telephone?: string
  private email?: string
  private motDePasseHache?: string
  private role?: string
  private statut?: string
  private superAdminTotpActive = false
  private superAdminTotpSecret: string | null = null
  private permissions: EntitePermissionUtilisateurAuth[] = []

  public avecId(valeur: string): this {
    this.id = valeur
    return this
  }

  public avecTelephone(valeur: string): this {
    this.telephone = valeur
    return this
  }

  public avecNomUtilisateur(valeur: string): this {
    return this.avecTelephone(valeur)
  }

  public avecEmail(valeur: string): this {
    this.email = valeur
    return this
  }

  public avecMotDePasseHache(valeur: string): this {
    this.motDePasseHache = valeur
    return this
  }

  public avecRole(valeur: string): this {
    this.role = valeur
    return this
  }

  public avecStatut(valeur: string): this {
    this.statut = valeur
    return this
  }

  public avecSuperAdminTotpActive(valeur: boolean): this {
    this.superAdminTotpActive = valeur
    return this
  }

  public avecSuperAdminTotpSecret(valeur: string | null): this {
    this.superAdminTotpSecret = valeur ?? null
    return this
  }

  public avecPermissions(valeur: EntitePermissionUtilisateurAuth[]): this {
    this.permissions = valeur
    return this
  }

  public avecCodesPermissions(codes: string[]): this {
    this.permissions = codes.map((code) =>
      new BuilderEntitePermissionUtilisateurAuth().avecCode(code).avecAutorise(true).construire()
    )
    return this
  }

  public construire(): EntiteUtilisateurAuthentification {
    return new EntiteUtilisateurAuthentification(
      this.exigerIdentifiant(this.id, 'id'),
      new ObjetValeurTelephoneSenegal(this.exiger(this.telephone, 'telephone')).valeur,
      new ObjetValeurEmail(this.exiger(this.email, 'email')).valeur,
      new ObjetValeurTexteNonVide(this.exiger(this.motDePasseHache, 'motDePasseHache'), 'motDePasseHache', 500)
        .valeur,
      this.exigerTexte(this.role, 'role', 60).toUpperCase(),
      this.exigerTexte(this.statut, 'statut', 60).toUpperCase(),
      Boolean(this.superAdminTotpActive),
      this.superAdminTotpSecret,
      this.permissions
    )
  }
}
