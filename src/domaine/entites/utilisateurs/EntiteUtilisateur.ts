import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EnumerationRoleUtilisateur } from '@/src/domaine/enumerations/EnumerationRoleUtilisateur'
import {
  ObjetValeurEmail,
  ObjetValeurIdentifiant,
  ObjetValeurIdentifiantConnexion,
  ObjetValeurTelephoneSenegal,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'
import { TypeStatutUtilisateur } from '@/src/domaine/types/utilisateurs/TypeStatutUtilisateur'

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
    new ObjetValeurIdentifiant(id)
    this.identifiantConnexion = new ObjetValeurIdentifiantConnexion(identifiantConnexion).valeur
    this.nomComplet = new ObjetValeurTexteNonVide(nomComplet, 'nomComplet', 200).valeur
    new ObjetValeurTexteNonVide(motDePasseHash, 'motDePasseHash', 500)
    if (telephone) {
      this.telephone = new ObjetValeurTelephoneSenegal(telephone).valeur
    }
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
