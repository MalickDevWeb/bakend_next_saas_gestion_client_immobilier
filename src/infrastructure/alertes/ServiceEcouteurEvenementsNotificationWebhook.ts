import { ServiceAlerteSuperAdminWebhook } from '@/src/infrastructure/alertes/ServiceAlerteSuperAdminWebhook'
import type {
  TypeEvenementNotification,
  TypeSeveriteEvenementNotification,
} from '@/src/infrastructure/alertes/ServiceEvenementsNotification'
import type { TypeRoleDestinataireNotification } from '@/src/coeur/interfaces/InterfaceNotification'

export class ServiceEcouteurEvenementsNotificationWebhook {
  constructor(private readonly serviceAlerteSuperAdminWebhook: ServiceAlerteSuperAdminWebhook) {}

  public async gerer(evenement: TypeEvenementNotification): Promise<void> {
    if (!this.serviceAlerteSuperAdminWebhook.estConfigure()) return

    await this.serviceAlerteSuperAdminWebhook.envoyer({
      eventType: String(evenement.code || '').trim() || 'NOTIFICATION_EVENT',
      titre: evenement.titre,
      severite: this.mapperSeverite(evenement.severite),
      acteurCible: this.resoudreActeurCible(evenement.rolesDestinataires),
      details: {
        message: evenement.message,
        rolesDestinataires: evenement.rolesDestinataires,
        ...(evenement.details || {}),
      },
    })
  }

  private mapperSeverite(severite: TypeSeveriteEvenementNotification): 'info' | 'warning' | 'critical' {
    if (severite === 'warning') return 'warning'
    if (severite === 'critical') return 'critical'
    return 'info'
  }

  private resoudreActeurCible(roles: TypeRoleDestinataireNotification[] | undefined): 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT' {
    const liste = roles || []
    if (liste.includes('SUPER_ADMIN')) return 'SUPER_ADMIN'
    if (liste.includes('ADMIN')) return 'ADMIN'
    return 'CLIENT'
  }
}
