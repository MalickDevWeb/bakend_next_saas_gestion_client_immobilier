import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteConfigurationPlateforme } from '@/src/domaine/entites/EntiteConfigurationPlateforme'
import { TypeConfigurationNotifications } from '@/src/domaine/types/TypesConfigurationNotifications'

export class BuilderEntiteConfigurationPlateforme extends BuilderAbstrait<EntiteConfigurationPlateforme> {
  private maintenanceActive = false
  private messageMaintenance = ''
  private dureeSessionMinutes = 480
  private timeoutInactiviteMinutes = 120
  private nombreEchecsConnexionMax = 5
  private dureeBlocageMinutes = 30
  private joursGracePaiement = 5
  private penaliteRetardPourcent = 0
  private bloquerSiRetard = true
  private tailleUploadMaxMb = 10
  private typesMimeAutorises = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  private dureeRetentionDocumentsJours = 365
  private notifications?: TypeConfigurationNotifications

  public avecMaintenanceActive(valeur: boolean): this { this.maintenanceActive = valeur; return this }
  public avecMessageMaintenance(valeur: string): this { this.messageMaintenance = valeur; return this }
  public avecDureeSessionMinutes(valeur: number): this { this.dureeSessionMinutes = valeur; return this }
  public avecTimeoutInactiviteMinutes(valeur: number): this { this.timeoutInactiviteMinutes = valeur; return this }
  public avecNombreEchecsConnexionMax(valeur: number): this { this.nombreEchecsConnexionMax = valeur; return this }
  public avecDureeBlocageMinutes(valeur: number): this { this.dureeBlocageMinutes = valeur; return this }
  public avecJoursGracePaiement(valeur: number): this { this.joursGracePaiement = valeur; return this }
  public avecPenaliteRetardPourcent(valeur: number): this { this.penaliteRetardPourcent = valeur; return this }
  public avecBloquerSiRetard(valeur: boolean): this { this.bloquerSiRetard = valeur; return this }
  public avecTailleUploadMaxMb(valeur: number): this { this.tailleUploadMaxMb = valeur; return this }
  public avecTypesMimeAutorises(valeur: string[]): this { this.typesMimeAutorises = valeur; return this }
  public avecDureeRetentionDocumentsJours(valeur: number): this { this.dureeRetentionDocumentsJours = valeur; return this }
  public avecNotifications(valeur: TypeConfigurationNotifications): this { this.notifications = valeur; return this }

  public construire(): EntiteConfigurationPlateforme {
    return new EntiteConfigurationPlateforme(
      this.maintenanceActive,
      this.messageMaintenance,
      Math.max(1, Math.floor(this.dureeSessionMinutes)),
      Math.max(1, Math.floor(this.timeoutInactiviteMinutes)),
      Math.max(1, Math.floor(this.nombreEchecsConnexionMax)),
      Math.max(1, Math.floor(this.dureeBlocageMinutes)),
      Math.max(0, Math.floor(this.joursGracePaiement)),
      Math.max(0, Math.min(100, this.penaliteRetardPourcent)),
      this.bloquerSiRetard,
      Math.max(1, this.tailleUploadMaxMb),
      this.typesMimeAutorises,
      Math.max(1, Math.floor(this.dureeRetentionDocumentsJours)),
      this.notifications
    )
  }
}
