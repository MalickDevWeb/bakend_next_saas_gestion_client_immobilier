import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { ObjetValeurBooleen } from '@/src/domaine/objets_valeur'
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
    this.tableauDeBord = new ObjetValeurBooleen(tableauDeBord).valeur
    this.clients = new ObjetValeurBooleen(clients).valeur
    this.locations = new ObjetValeurBooleen(locations).valeur
    this.paiements = new ObjetValeurBooleen(paiements).valeur
    this.documents = new ObjetValeurBooleen(documents).valeur
    this.parametres = new ObjetValeurBooleen(parametres).valeur
    this.travaux = new ObjetValeurBooleen(travaux).valeur
    this.imports = new ObjetValeurBooleen(imports).valeur
    this.notifications = new ObjetValeurBooleen(notifications).valeur
    this.exportPdf = new ObjetValeurBooleen(exportPdf).valeur
  }

  public nombrePermissionsActives(): number {
    return Object.values(this).filter(Boolean).length
  }
}
