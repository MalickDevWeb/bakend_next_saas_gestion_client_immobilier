import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteEntreprise } from '@/src/domaine/entites/administration/EntiteEntreprise'

export class BuilderEntiteEntreprise extends BuilderAbstrait<EntiteEntreprise> {
  private id?: string
  private nom?: string
  private adminId?: string
  private creeLe?: Date

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecNom(valeur: string): this { this.nom = valeur; return this }
  public avecAdminId(valeur: string): this { this.adminId = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }

  public construire(): EntiteEntreprise {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const nom = this.exigerTexte(this.nom, 'nom')
    const adminId = this.adminId ? this.exigerIdentifiant(this.adminId, 'adminId') : undefined
    return new EntiteEntreprise(id, nom, adminId, this.dateOuMaintenant(this.creeLe))
  }
}
