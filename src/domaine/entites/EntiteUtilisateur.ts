import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EnumerationRoleUtilisateur } from '@/src/domaine/enumerations/EnumerationRoleUtilisateur'
import { ObjetValeurEmail } from '@/src/domaine/objets_valeur/ObjetValeurEmail'
import { TypeStatutUtilisateur } from '@/src/domaine/types/TypeStatutUtilisateur'

export class EntiteUtilisateur extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public identifiantConnexion: string,
    public nomComplet: string,
    public email: ObjetValeurEmail,
    public role: EnumerationRoleUtilisateur = EnumerationRoleUtilisateur.UTILISATEUR,
    public statut: TypeStatutUtilisateur = 'ACTIF',
    public motDePasseHash: string = '',
    public telephone?: string,
    public readonly creeLe: Date = new Date()
  ) {
    super()
  }

  public estActif(): boolean {
    return this.statut === 'ACTIF'
  }

  public estSuperAdmin(): boolean {
    return this.role === EnumerationRoleUtilisateur.SUPER_ADMIN
  }

  public desactiver(): void {
    this.statut = 'SUSPENDU'
  }
}
