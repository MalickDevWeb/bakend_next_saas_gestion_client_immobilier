import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteUtilisateur } from '@/src/domaine/entites/EntiteUtilisateur'
import { EnumerationRoleUtilisateur } from '@/src/domaine/enumerations/EnumerationRoleUtilisateur'
import { ObjetValeurEmail, ObjetValeurTelephoneSenegal } from '@/src/domaine/objets_valeur'
import { TypeStatutUtilisateur } from '@/src/domaine/types/TypeStatutUtilisateur'

export class BuilderEntiteUtilisateur extends BuilderAbstrait<EntiteUtilisateur> {
  private id?: string
  private identifiantConnexion?: string
  private nomComplet?: string
  private email?: string
  private role: EnumerationRoleUtilisateur = EnumerationRoleUtilisateur.UTILISATEUR
  private statut: TypeStatutUtilisateur = 'ACTIF'
  private motDePasseHash?: string
  private telephone?: string
  private creeLe?: Date

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecIdentifiantConnexion(valeur: string): this { this.identifiantConnexion = valeur; return this }
  public avecNomComplet(valeur: string): this { this.nomComplet = valeur; return this }
  public avecEmail(valeur: string): this { this.email = valeur; return this }
  public avecRole(valeur: EnumerationRoleUtilisateur): this { this.role = valeur; return this }
  public avecStatut(valeur: TypeStatutUtilisateur): this { this.statut = valeur; return this }
  public avecMotDePasseHash(valeur: string): this { this.motDePasseHash = valeur; return this }
  public avecTelephone(valeur: string): this { this.telephone = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }

  public construire(): EntiteUtilisateur {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const identifiantConnexion = this.exigerTexte(this.identifiantConnexion, 'identifiantConnexion')
    const nomComplet = this.exigerTexte(this.nomComplet, 'nomComplet')
    const email = new ObjetValeurEmail(this.exiger(this.email, 'email'))
    const motDePasseHash = this.exigerTexte(this.motDePasseHash, 'motDePasseHash', 500)
    const telephone = this.telephone
      ? new ObjetValeurTelephoneSenegal(this.telephone).valeur
      : undefined

    return new EntiteUtilisateur(
      id,
      identifiantConnexion,
      nomComplet,
      email,
      this.role,
      this.statut,
      motDePasseHash,
      telephone,
      this.dateOuMaintenant(this.creeLe)
    )
  }
}
