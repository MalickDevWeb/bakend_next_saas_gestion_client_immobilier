import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { TypeMetadonneesActionAnnulationAdministrationAdmin, TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { ExceptionAuthentificationAutorisation } from '@/src/application/exceptions'
import { ServiceAdministrationAdminUtilitaires } from '@/src/application/services/administration/commun/ServiceAdministrationAdminUtilitaires'
import type { TypeDependancesServiceAdministrationAdminNotificationsAnnulation } from '@/src/application/types/administration/notifications/TypeDependancesServiceAdministrationAdminNotificationsAnnulation'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

export class ServiceAdministrationAdminNotificationsAnnulation {
  constructor(
    private readonly dependances: TypeDependancesServiceAdministrationAdminNotificationsAnnulation
  ) {}

  public async listerNotifications(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    utilisateurId?: string | null,
    champTri?: string | null,
    ordreTri?: string | null
  ): Promise<Record<string, unknown>[]> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(
      jetonAcces,
      impersonation,
      'notifications'
    )

    const cibleUtilisateurId = String(utilisateurId || contexte.utilisateurId)
    const elements = (await this.dependances.daoNotification.lister())
      .filter((notification) => notification.utilisateurId === cibleUtilisateurId)
      .map((notification) => this.dependances.mappeur.mapperNotificationEnDto(notification))

    return ServiceAdministrationAdminUtilitaires.trierElements(elements, champTri, ordreTri)
  }

  public async marquerNotificationLue(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    notificationId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(
      jetonAcces,
      impersonation,
      'notifications'
    )

    const notification = await this.dependances.daoNotification.rechercherParId(notificationId)
    this.exigerEntite(notification, t(ERRORS.ADMIN_NOTIFICATION_INTROUVABLE))

    if (notification.utilisateurId !== contexte.utilisateurId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    const avant = this.dependances.mappeur.mapperNotificationEnDto(notification)
    notification.marquerCommeLue()
    await this.dependances.daoNotification.sauvegarder(notification)

    const dto = this.dependances.mappeur.mapperNotificationEnDto(notification)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'notifications',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: notificationId,
      path: `/notifications/${notificationId}`,
      executerRollback: async () => {
        const entite = this.dependances.constructeur.construireEntiteNotificationDepuisCorps(
          ServiceAdministrationAdminUtilitaires.versObjet(avant),
          String(avant.user_id || avant.utilisateurId || ''),
          notificationId
        )
        await this.dependances.daoNotification.sauvegarder(entite)
      },
    })

    return { donnees: dto, annulation }
  }

  public async listerActionsAnnulation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    limite: number
  ): Promise<TypeMetadonneesActionAnnulationAdministrationAdmin[]> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(
      jetonAcces,
      impersonation,
      'undo-actions'
    )
    return this.dependances.annulation.listerActionsAnnulation(contexte.utilisateurId, limite)
  }

  public async annulerAction(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    actionId: string
  ): Promise<{ ok: true; rolledBackId: string }> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(
      jetonAcces,
      impersonation,
      'undo-actions'
    )
    return this.dependances.annulation.annulerAction(contexte.utilisateurId, actionId)
  }

  private exigerEntite<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }
}
