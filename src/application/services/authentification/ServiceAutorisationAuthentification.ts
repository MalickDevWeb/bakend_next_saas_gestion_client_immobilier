import { DtoUtilisateurAuthentifie } from '@/src/application/dtos/authentification/DtoAuthentification'
import { ServiceContexteAuthentification } from '@/src/application/services/authentification/ServiceContexteAuthentification'
import { t } from '@/src/messages'
import { ERRORS } from '@/src/messages/app/errors'
import { ExceptionAuthentificationAutorisation } from '@/src/application/exceptions'

export class ServiceAutorisationAuthentification {
  constructor(private readonly serviceContexteAuthentification: ServiceContexteAuthentification) {}

  public async verifierPermission(
    jetonAcces: string,
    permission: string
  ): Promise<DtoUtilisateurAuthentifie> {
    const contexte = await this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
      jetonAcces
    )
    const permissions = new Set(contexte.utilisateur.permissions)
    if (!permissions.has(permission)) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE), {
        permission,
      })
    }
    return contexte.utilisateur
  }

  public async exigerSecondeAuthSuperAdmin(
    jetonAcces: string
  ): Promise<DtoUtilisateurAuthentifie> {
    const contexte = await this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
      jetonAcces
    )
    if (
      String(contexte.utilisateur.role || '').toUpperCase() === 'SUPER_ADMIN' &&
      contexte.utilisateur.superAdminSecondAuthRequired
    ) {
      throw new ExceptionAuthentificationAutorisation(
        t(ERRORS.AUTH_SECONDE_AUTH_SUPER_ADMIN_REQUISE),
        {
          code: 'SUPER_ADMIN_SECOND_AUTH_REQUIRED',
        }
      )
    }
    return contexte.utilisateur
  }
}
