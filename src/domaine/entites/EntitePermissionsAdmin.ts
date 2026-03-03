import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
export class EntitePermissionsAdmin extends ObjetDomaine {
  constructor(
    public tableauDeBord = true,
    public clients = true,
    public locations = true,
    public paiements = true,
    public documents = true,
    public parametres = true,
    public travaux = true,
    public imports = true,
    public notifications = true,
    public exportPdf = true
  ) {
    super()
  }

  public nombrePermissionsActives(): number {
    return Object.values(this).filter(Boolean).length
  }
}
