import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { TypeConfigurationNotifications } from '@/src/domaine/types/TypesConfigurationNotifications'

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
  }
}
