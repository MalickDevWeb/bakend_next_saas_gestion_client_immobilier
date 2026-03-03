import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { TypeMethodePaiementAbonnement } from '@/src/domaine/types/TypeMethodePaiementAbonnement'
import { TypeModeAbonnementAdmin } from '@/src/domaine/types/TypeModeAbonnementAdmin'
import { TypeStatutPaiementAbonnement } from '@/src/domaine/types/TypeStatutPaiementAbonnement'

export class EntitePaiementAbonnementAdmin extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public readonly adminId: string,
    public montant: number,
    public methode: TypeMethodePaiementAbonnement,
    public mois: string,
    public entrepriseId?: string,
    public statut: TypeStatutPaiementAbonnement = 'pending',
    public fournisseur?: 'stripe' | 'wave' | 'orange' | 'manual',
    public referenceFournisseur?: string,
    public urlPaiement?: string,
    public telephonePayeur?: string,
    public referenceTransaction?: string,
    public note?: string,
    public payeLe?: Date | null,
    public approuveLe?: Date | null,
    public approuvePar?: string | null,
    public modeAbonnement: TypeModeAbonnementAdmin = 'monthly',
    public readonly creeLe: Date = new Date()
  ) {
    super()
  }

  public marquerCommePaye(datePaiement: Date = new Date()): void {
    this.statut = 'paid'
    this.payeLe = datePaiement
  }
}
