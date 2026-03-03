import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
export class EntiteErreurImport extends ObjetDomaine {
  constructor(
    public readonly numeroLigne: number,
    public erreurs: string[],
    public donneesBrutes: Record<string, unknown>
  ) {
    super()
  }
}
