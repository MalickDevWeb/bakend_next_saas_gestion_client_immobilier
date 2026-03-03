import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntitePermissionUtilisateurAuth } from '@/src/domaine/entites/authentification/EntitePermissionUtilisateurAuth'
import {
  ObjetValeurEmail,
  ObjetValeurIdentifiant,
  ObjetValeurIdentifiantConnexion,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'

export class EntiteUtilisateurAuthentification extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public readonly nomUtilisateur: string,
    public readonly email: string,
    public readonly motDePasseHache: string,
    public readonly role: string,
    public readonly statut: string,
    public readonly superAdminTotpActive: boolean,
    public readonly superAdminTotpSecret: string | null,
    public readonly permissions: EntitePermissionUtilisateurAuth[] = []
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    new ObjetValeurIdentifiantConnexion(nomUtilisateur)
    new ObjetValeurEmail(email)
    new ObjetValeurTexteNonVide(motDePasseHache, 'motDePasseHache', 500)
    new ObjetValeurTexteNonVide(role, 'role', 60)
    new ObjetValeurTexteNonVide(statut, 'statut', 60)
    if (superAdminTotpSecret) {
      new ObjetValeurTexteNonVide(superAdminTotpSecret, 'superAdminTotpSecret', 500)
    }
  }

  public estActif(): boolean {
    return String(this.statut).toUpperCase() === 'ACTIF'
  }

  public estSuperAdmin(): boolean {
    return String(this.role).toUpperCase() === 'SUPER_ADMIN'
  }

  public codesPermissionsAutorisees(): string[] {
    return this.permissions.filter((permission) => permission.autorise).map((permission) => permission.code)
  }
}
