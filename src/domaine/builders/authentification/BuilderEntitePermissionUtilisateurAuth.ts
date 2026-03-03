import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntitePermissionUtilisateurAuth } from '@/src/domaine/entites/authentification/EntitePermissionUtilisateurAuth'

export class BuilderEntitePermissionUtilisateurAuth extends BuilderAbstrait<EntitePermissionUtilisateurAuth> {
  private code?: string
  private autorise = true

  public avecCode(valeur: string): this {
    this.code = valeur
    return this
  }

  public avecAutorise(valeur: boolean): this {
    this.autorise = valeur
    return this
  }

  public construire(): EntitePermissionUtilisateurAuth {
    return new EntitePermissionUtilisateurAuth(
      this.exigerTexte(this.code, 'code', 120),
      Boolean(this.autorise)
    )
  }
}
