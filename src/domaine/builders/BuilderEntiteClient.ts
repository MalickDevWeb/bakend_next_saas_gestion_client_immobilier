import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteClient } from '@/src/domaine/entites/EntiteClient'
import { EntiteLocation } from '@/src/domaine/entites/EntiteLocation'
import {
  ObjetValeurCniSenegal,
  ObjetValeurEmail,
  ObjetValeurTelephoneSenegal,
} from '@/src/domaine/objets_valeur'
import { TypeStatutClient } from '@/src/domaine/types/TypeStatutClient'

export class BuilderEntiteClient extends BuilderAbstrait<EntiteClient> {
  private id?: string
  private prenom?: string
  private nom?: string
  private telephone?: string
  private cni?: string
  private adminId?: string
  private email?: string
  private statut: TypeStatutClient = 'active'
  private creeLe?: Date
  private locations: EntiteLocation[] = []

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecPrenom(valeur: string): this { this.prenom = valeur; return this }
  public avecNom(valeur: string): this { this.nom = valeur; return this }
  public avecTelephone(valeur: string): this { this.telephone = valeur; return this }
  public avecCni(valeur: string): this { this.cni = valeur; return this }
  public avecAdminId(valeur: string): this { this.adminId = valeur; return this }
  public avecEmail(valeur: string): this { this.email = valeur; return this }
  public avecStatut(valeur: TypeStatutClient): this { this.statut = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }
  public avecLocations(valeur: EntiteLocation[]): this { this.locations = valeur; return this }

  public construire(): EntiteClient {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const prenom = this.exigerTexte(this.prenom, 'prenom')
    const nom = this.exigerTexte(this.nom, 'nom')
    const telephone = new ObjetValeurTelephoneSenegal(this.exiger(this.telephone, 'telephone')).valeur
    const cni = new ObjetValeurCniSenegal(this.exiger(this.cni, 'cni')).valeur
    const adminId = this.adminId ? this.exigerIdentifiant(this.adminId, 'adminId') : undefined
    const email = this.email ? new ObjetValeurEmail(this.email).valeur : undefined

    return new EntiteClient(
      id,
      prenom,
      nom,
      telephone,
      cni,
      adminId,
      email,
      this.statut,
      this.dateOuMaintenant(this.creeLe),
      this.locations
    )
  }
}
