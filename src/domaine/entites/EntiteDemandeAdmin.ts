import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { TypeStatutAdmin } from '@/src/domaine/types/TypeStatutAdmin'

export class EntiteDemandeAdmin extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public nom: string,
    public email?: string,
    public telephone?: string,
    public nomEntreprise?: string,
    public statut: TypeStatutAdmin = 'EN_ATTENTE',
    public nomUtilisateur?: string,
    public motDePasse?: string,
    public paye = false,
    public payeLe?: Date,
    public readonly creeLe: Date = new Date()
  ) {
    super()
  }

  public marquerCommePayee(datePaiement: Date = new Date()): void {
    this.paye = true
    this.payeLe = datePaiement
  }
}
