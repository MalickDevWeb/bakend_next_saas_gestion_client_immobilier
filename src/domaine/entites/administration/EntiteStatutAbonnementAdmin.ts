import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import {
  ObjetValeurIdentifiant,
  ObjetValeurMoisComptable,
  ObjetValeurMontant,
} from '@/src/domaine/objets_valeur'
import { TypeModeAbonnementAdmin } from '@/src/domaine/types/administration/TypeModeAbonnementAdmin'

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
    new ObjetValeurIdentifiant(adminId)
    this.moisRequis = new ObjetValeurMoisComptable(moisRequis).valeur
    this.moisCourant = new ObjetValeurMoisComptable(moisCourant).valeur
    if (moisEnRetard) {
      this.moisEnRetard = new ObjetValeurMoisComptable(moisEnRetard).valeur
    }
    this.joursGrace = Math.max(0, Math.floor(joursGrace))
    if (typeof montantAttendu === 'number') {
      this.montantAttendu = new ObjetValeurMontant(montantAttendu).valeur
    }
  }

  public estEnRetard(): boolean {
    return Boolean(this.moisEnRetard)
  }

  public doitEtreBloque(): boolean {
    return this.bloque || this.estEnRetard()
  }
}
