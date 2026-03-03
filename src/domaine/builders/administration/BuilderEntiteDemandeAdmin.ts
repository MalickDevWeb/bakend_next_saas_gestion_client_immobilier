import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteDemandeAdmin } from '@/src/domaine/entites/administration/EntiteDemandeAdmin'
import { ObjetValeurEmail, ObjetValeurTelephoneSenegal } from '@/src/domaine/objets_valeur'
import { TypeStatutAdmin } from '@/src/domaine/types/administration/TypeStatutAdmin'

export class BuilderEntiteDemandeAdmin extends BuilderAbstrait<EntiteDemandeAdmin> {
  private id?: string
  private nom?: string
  private email?: string
  private telephone?: string
  private nomEntreprise?: string
  private statut: TypeStatutAdmin = 'EN_ATTENTE'
  private nomUtilisateur?: string
  private motDePasse?: string
  private paye = false
  private payeLe?: Date
  private creeLe?: Date

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecNom(valeur: string): this { this.nom = valeur; return this }
  public avecEmail(valeur: string): this { this.email = valeur; return this }
  public avecTelephone(valeur: string): this { this.telephone = valeur; return this }
  public avecNomEntreprise(valeur: string): this { this.nomEntreprise = valeur; return this }
  public avecStatut(valeur: TypeStatutAdmin): this { this.statut = valeur; return this }
  public avecNomUtilisateur(valeur: string): this { this.nomUtilisateur = valeur; return this }
  public avecMotDePasse(valeur: string): this { this.motDePasse = valeur; return this }
  public avecPaye(valeur: boolean): this { this.paye = valeur; return this }
  public avecDatePaiement(valeur: Date): this { this.payeLe = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }

  public construire(): EntiteDemandeAdmin {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const nom = this.exigerTexte(this.nom, 'nom')
    const email = this.email ? new ObjetValeurEmail(this.email).valeur : undefined
    const telephone = this.telephone ? new ObjetValeurTelephoneSenegal(this.telephone).valeur : undefined
    const nomEntreprise = this.nomEntreprise ? this.exigerTexte(this.nomEntreprise, 'nomEntreprise') : undefined

    return new EntiteDemandeAdmin(
      id,
      nom,
      email,
      telephone,
      nomEntreprise,
      this.statut,
      this.nomUtilisateur,
      this.motDePasse,
      this.paye,
      this.payeLe,
      this.dateOuMaintenant(this.creeLe)
    )
  }
}
