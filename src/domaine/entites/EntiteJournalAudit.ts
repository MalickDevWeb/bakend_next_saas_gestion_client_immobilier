import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
export class EntiteJournalAudit extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public acteur?: string,
    public action?: string,
    public typeCible?: string,
    public idCible?: string,
    public message?: string,
    public adresseIp?: string,
    public readonly creeLe: Date = new Date()
  ) {
    super()
  }
}
