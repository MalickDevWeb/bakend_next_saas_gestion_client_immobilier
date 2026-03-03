import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteItemTravail } from '@/src/domaine/entites/EntiteItemTravail'
import { TypePrioriteTravail } from '@/src/domaine/types/TypePrioriteTravail'
import { TypeStatutTravail } from '@/src/domaine/types/TypeStatutTravail'

export class BuilderEntiteItemTravail extends BuilderAbstrait<EntiteItemTravail> {
  private id?: string
  private titre?: string
  private description?: string
  private priorite: TypePrioriteTravail = 'medium'
  private statut: TypeStatutTravail = 'pending'
  private creeLe?: Date
  private dateEcheance?: Date
  private detecteAutomatiquement = false

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecTitre(valeur: string): this { this.titre = valeur; return this }
  public avecDescription(valeur: string): this { this.description = valeur; return this }
  public avecPriorite(valeur: TypePrioriteTravail): this { this.priorite = valeur; return this }
  public avecStatut(valeur: TypeStatutTravail): this { this.statut = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }
  public avecDateEcheance(valeur: Date): this { this.dateEcheance = valeur; return this }
  public avecDetecteAutomatiquement(valeur: boolean): this { this.detecteAutomatiquement = valeur; return this }

  public construire(): EntiteItemTravail {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const titre = this.exigerTexte(this.titre, 'titre')
    const description = this.exigerTexte(this.description, 'description', 1000)

    return new EntiteItemTravail(
      id,
      titre,
      description,
      this.priorite,
      this.statut,
      this.dateOuMaintenant(this.creeLe),
      this.dateEcheance,
      this.detecteAutomatiquement
    )
  }
}
