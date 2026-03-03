import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntiteLocation } from '@/src/domaine/entites/EntiteLocation'
import { TypeStatutClient } from '@/src/domaine/types/TypeStatutClient'

export class EntiteClient extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public prenom: string,
    public nom: string,
    public telephone: string,
    public cni: string,
    public adminId?: string,
    public email?: string,
    public statut: TypeStatutClient = 'active',
    public readonly creeLe: Date = new Date(),
    public locations: EntiteLocation[] = []
  ) {
    super()
  }

  public nomComplet(): string {
    return `${this.prenom} ${this.nom}`.trim()
  }

  public ajouterLocation(location: EntiteLocation): void {
    this.locations.push(location)
  }

  public aDesLocations(): boolean {
    return this.locations.length > 0
  }
}
