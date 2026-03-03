import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
export class EntiteIpBloquee extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public adresseIp: string,
    public raison?: string,
    public readonly creeLe: Date = new Date()
  ) {
    super()
  }
}
