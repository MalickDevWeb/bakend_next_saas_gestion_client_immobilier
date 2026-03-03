import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntitePermissionsAdmin } from '@/src/domaine/entites/EntitePermissionsAdmin'
import { TypeModeAbonnementAdmin } from '@/src/domaine/types/TypeModeAbonnementAdmin'
import { TypeStatutAdmin } from '@/src/domaine/types/TypeStatutAdmin'

export class EntiteAdmin extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public readonly utilisateurId: string,
    public nomUtilisateur: string,
    public nom: string,
    public email: string,
    public statut: TypeStatutAdmin = 'EN_ATTENTE',
    public entrepriseId?: string,
    public modeAbonnement: TypeModeAbonnementAdmin = 'monthly',
    public montantMensuelAbonnement = 0,
    public montantAnnuelAbonnement = 0,
    public autoriserMontantPersonnalise = false,
    public permissions: EntitePermissionsAdmin = new EntitePermissionsAdmin(),
    public readonly creeLe: Date = new Date()
  ) {
    super()
  }

  public estActif(): boolean {
    return this.statut === 'ACTIF'
  }

  public peutAcceder(fonctionnalite: keyof EntitePermissionsAdmin): boolean {
    return Boolean(this.permissions[fonctionnalite])
  }
}
