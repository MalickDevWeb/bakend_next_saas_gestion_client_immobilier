import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
export class EntiteEntreprise extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public nom: string,
    public adminId?: string,
    public readonly creeLe: Date = new Date()
  ) {
    super()
  }
}
