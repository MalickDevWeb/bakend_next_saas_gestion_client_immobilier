import { EntitePermissionsAdmin } from '@/src/domaine/entites/administration/EntitePermissionsAdmin'

export class BuilderEntitePermissionsAdmin {
  private permissions = new EntitePermissionsAdmin()

  public avecTableauDeBord(valeur: boolean): this {
    this.permissions.tableauDeBord = valeur
    return this
  }

  public avecClients(valeur: boolean): this {
    this.permissions.clients = valeur
    return this
  }

  public avecLocations(valeur: boolean): this {
    this.permissions.locations = valeur
    return this
  }

  public avecPaiements(valeur: boolean): this {
    this.permissions.paiements = valeur
    return this
  }

  public avecDocuments(valeur: boolean): this {
    this.permissions.documents = valeur
    return this
  }

  public avecParametres(valeur: boolean): this {
    this.permissions.parametres = valeur
    return this
  }

  public avecTravaux(valeur: boolean): this {
    this.permissions.travaux = valeur
    return this
  }

  public avecImports(valeur: boolean): this {
    this.permissions.imports = valeur
    return this
  }

  public avecNotifications(valeur: boolean): this {
    this.permissions.notifications = valeur
    return this
  }

  public avecExportPdf(valeur: boolean): this {
    this.permissions.exportPdf = valeur
    return this
  }

  public construire(): EntitePermissionsAdmin {
    return this.permissions
  }
}
