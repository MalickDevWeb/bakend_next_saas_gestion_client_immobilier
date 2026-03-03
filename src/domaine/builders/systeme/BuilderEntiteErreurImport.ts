import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteErreurImport } from '@/src/domaine/entites/systeme/EntiteErreurImport'

export class BuilderEntiteErreurImport extends BuilderAbstrait<EntiteErreurImport> {
  private numeroLigne = 1
  private erreurs: string[] = []
  private donneesBrutes: Record<string, unknown> = {}

  public avecNumeroLigne(valeur: number): this { this.numeroLigne = valeur; return this }
  public avecErreurs(valeur: string[]): this { this.erreurs = valeur; return this }
  public avecDonneesBrutes(valeur: Record<string, unknown>): this { this.donneesBrutes = valeur; return this }

  public construire(): EntiteErreurImport {
    const numeroLigne = Math.max(1, Math.floor(this.numeroLigne))
    const erreurs = this.erreurs.map((erreur) => String(erreur || '').trim()).filter(Boolean)
    return new EntiteErreurImport(numeroLigne, erreurs, this.donneesBrutes)
  }
}
