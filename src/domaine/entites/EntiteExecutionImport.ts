import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntiteErreurImport } from '@/src/domaine/entites/EntiteErreurImport'
import { TypeLigneImportee } from '@/src/domaine/types/TypeLigneImportee'

export class EntiteExecutionImport extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public adminId?: string,
    public nomFichier?: string,
    public nombreLignesTotal = 0,
    public lignesInserees: TypeLigneImportee[] = [],
    public erreurs: EntiteErreurImport[] = [],
    public ignoree = false,
    public lectureReussie = true,
    public lectureAvecErreurs = false,
    public readonly creeLe: Date = new Date(),
    public misAJourLe: Date = new Date()
  ) {
    super()
  }

  public nombreErreurs(): number {
    return this.erreurs.length
  }

  public aDesErreurs(): boolean {
    return this.nombreErreurs() > 0
  }
}
