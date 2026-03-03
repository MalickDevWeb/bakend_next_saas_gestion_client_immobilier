import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { ObjetValeurTexteNonVide } from '@/src/domaine/objets_valeur'
import { TypeConfigurationNotifications } from '@/src/domaine/types/systeme/TypesConfigurationNotifications'

export class EntiteConfigurationPlateforme extends ObjetDomaine {
  constructor(
    public maintenanceActive = false,
    public messageMaintenance = '',
    public dureeSessionMinutes = 480,
    public timeoutInactiviteMinutes = 120,
    public nombreEchecsConnexionMax = 5,
    public dureeBlocageMinutes = 30,
    public joursGracePaiement = 5,
    public penaliteRetardPourcent = 0,
    public bloquerSiRetard = true,
    public tailleUploadMaxMb = 10,
    public typesMimeAutorises: string[] = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    public dureeRetentionDocumentsJours = 365,
    public notifications: TypeConfigurationNotifications = {
      canaux: { sms: false, email: true, whatsapp: false },
      evenements: { maintenance: true, echecConnexion: true, retardPaiement: true, erreurApi: true },
      templates: {
        maintenance: 'Maintenance active: {message}',
        echecConnexion: 'Tentative de connexion echouee pour {username}',
        retardPaiement: 'Abonnement en retard pour {adminId} ({month})',
        erreurApi: 'Erreur API {path}: {error}',
      },
    }
  ) {
    super()
    this.messageMaintenance = this.messageMaintenance
      ? new ObjetValeurTexteNonVide(this.messageMaintenance, 'messageMaintenance', 500).valeur
      : ''
    this.typesMimeAutorises = this.typesMimeAutorises
      .map((typeMime) => new ObjetValeurTexteNonVide(typeMime, 'typeMime', 120).valeur)
      .filter(Boolean)
    this.notifications = {
      canaux: {
        sms: Boolean(this.notifications.canaux.sms),
        email: Boolean(this.notifications.canaux.email),
        whatsapp: Boolean(this.notifications.canaux.whatsapp),
      },
      evenements: {
        maintenance: Boolean(this.notifications.evenements.maintenance),
        echecConnexion: Boolean(this.notifications.evenements.echecConnexion),
        retardPaiement: Boolean(this.notifications.evenements.retardPaiement),
        erreurApi: Boolean(this.notifications.evenements.erreurApi),
      },
      templates: {
        maintenance: new ObjetValeurTexteNonVide(this.notifications.templates.maintenance, 'template.maintenance', 300)
          .valeur,
        echecConnexion: new ObjetValeurTexteNonVide(
          this.notifications.templates.echecConnexion,
          'template.echecConnexion',
          300
        ).valeur,
        retardPaiement: new ObjetValeurTexteNonVide(
          this.notifications.templates.retardPaiement,
          'template.retardPaiement',
          300
        ).valeur,
        erreurApi: new ObjetValeurTexteNonVide(this.notifications.templates.erreurApi, 'template.erreurApi', 300)
          .valeur,
      },
    }
    this.dureeSessionMinutes = Math.max(1, Math.floor(this.dureeSessionMinutes))
    this.timeoutInactiviteMinutes = Math.max(1, Math.floor(this.timeoutInactiviteMinutes))
    this.nombreEchecsConnexionMax = Math.max(1, Math.floor(this.nombreEchecsConnexionMax))
    this.dureeBlocageMinutes = Math.max(1, Math.floor(this.dureeBlocageMinutes))
    this.joursGracePaiement = Math.max(0, Math.floor(this.joursGracePaiement))
    this.penaliteRetardPourcent = Math.max(0, Math.min(100, Number(this.penaliteRetardPourcent || 0)))
    this.tailleUploadMaxMb = Math.max(1, Number(this.tailleUploadMaxMb || 1))
    this.dureeRetentionDocumentsJours = Math.max(1, Math.floor(this.dureeRetentionDocumentsJours))
  }
}
