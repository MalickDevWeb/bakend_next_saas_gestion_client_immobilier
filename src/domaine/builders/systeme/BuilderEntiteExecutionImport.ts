import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteErreurImport } from '@/src/domaine/entites/systeme/EntiteErreurImport'
import { EntiteExecutionImport } from '@/src/domaine/entites/systeme/EntiteExecutionImport'
import { TypeLigneImportee } from '@/src/domaine/types/systeme/TypeLigneImportee'

export class BuilderEntiteExecutionImport extends BuilderAbstrait<EntiteExecutionImport> {
  private id?: string
  private adminId?: string
  private nomFichier?: string
  private nombreLignesTotal = 0
  private lignesInserees: TypeLigneImportee[] = []
  private erreurs: EntiteErreurImport[] = []
  private ignoree = false
  private lectureReussie = true
  private lectureAvecErreurs = false
  private creeLe?: Date
  private misAJourLe?: Date

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecAdminId(valeur: string): this { this.adminId = valeur; return this }
  public avecNomFichier(valeur: string): this { this.nomFichier = valeur; return this }
  public avecNombreLignesTotal(valeur: number): this { this.nombreLignesTotal = valeur; return this }
  public avecLignesInserees(valeur: TypeLigneImportee[]): this { this.lignesInserees = valeur; return this }
  public avecErreurs(valeur: EntiteErreurImport[]): this { this.erreurs = valeur; return this }
  public avecIgnoree(valeur: boolean): this { this.ignoree = valeur; return this }
  public avecLectureReussie(valeur: boolean): this { this.lectureReussie = valeur; return this }
  public avecLectureAvecErreurs(valeur: boolean): this { this.lectureAvecErreurs = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }
  public avecDateMiseAJour(valeur: Date): this { this.misAJourLe = valeur; return this }

  public construire(): EntiteExecutionImport {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const adminId = this.adminId ? this.exigerIdentifiant(this.adminId, 'adminId') : undefined
    const nomFichier = this.nomFichier ? this.exigerTexte(this.nomFichier, 'nomFichier') : undefined

    return new EntiteExecutionImport(
      id,
      adminId,
      nomFichier,
      Math.max(0, Math.floor(this.nombreLignesTotal)),
      this.lignesInserees,
      this.erreurs,
      this.ignoree,
      this.lectureReussie,
      this.lectureAvecErreurs,
      this.dateOuMaintenant(this.creeLe),
      this.dateOuMaintenant(this.misAJourLe)
    )
  }
}
