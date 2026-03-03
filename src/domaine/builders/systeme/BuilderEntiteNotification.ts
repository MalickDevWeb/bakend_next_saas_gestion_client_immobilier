import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteNotification } from '@/src/domaine/entites/systeme/EntiteNotification'

export class BuilderEntiteNotification extends BuilderAbstrait<EntiteNotification> {
  private id?: string
  private utilisateurId?: string
  private message?: string
  private type?: string
  private estLue = false
  private creeLe?: Date

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecUtilisateurId(valeur: string): this { this.utilisateurId = valeur; return this }
  public avecMessage(valeur: string): this { this.message = valeur; return this }
  public avecType(valeur: string): this { this.type = valeur; return this }
  public avecEstLue(valeur: boolean): this { this.estLue = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }

  public construire(): EntiteNotification {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const utilisateurId = this.exigerIdentifiant(this.utilisateurId, 'utilisateurId')
    const message = this.exigerTexte(this.message, 'message', 2000)
    return new EntiteNotification(id, utilisateurId, message, this.type, this.estLue, this.dateOuMaintenant(this.creeLe))
  }
}
