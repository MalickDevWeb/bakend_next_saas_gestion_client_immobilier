import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntiteErreurImport } from '@/src/domaine/entites/systeme/EntiteErreurImport'
import { ObjetValeurIdentifiant, ObjetValeurTexteNonVide } from '@/src/domaine/objets_valeur'
import { TypeLigneImportee } from '@/src/domaine/types/systeme/TypeLigneImportee'

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
    new ObjetValeurIdentifiant(id)
    if (adminId) new ObjetValeurIdentifiant(adminId)
    if (nomFichier) {
      this.nomFichier = new ObjetValeurTexteNonVide(nomFichier, 'nomFichier', 255).valeur
    }
    this.nombreLignesTotal = Math.max(0, Math.floor(this.nombreLignesTotal))
  }

  public nombreErreurs(): number {
    return this.erreurs.length
  }

  public aDesErreurs(): boolean {
    return this.nombreErreurs() > 0
  }
}
