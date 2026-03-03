import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { TypeModeAbonnementAdmin } from '@/src/domaine/types/TypeModeAbonnementAdmin'

export class EntiteStatutAbonnementAdmin extends ObjetDomaine {
  constructor(
    public readonly adminId: string,
    public bloque: boolean,
    public moisEnRetard: string | null,
    public echeance: Date | null,
    public moisRequis: string,
    public moisCourant: string,
    public joursGrace: number,
    public modeAbonnement: TypeModeAbonnementAdmin = 'monthly',
    public montantAttendu?: number,
    public autoriserMontantLibre = false
  ) {
    super()
  }

  public estEnRetard(): boolean {
    return Boolean(this.moisEnRetard)
  }

  public doitEtreBloque(): boolean {
    return this.bloque || this.estEnRetard()
  }
}
