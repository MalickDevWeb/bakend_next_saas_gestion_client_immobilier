import { ServiceAuthentification } from '@/src/application/services/authentification/ServiceAuthentification'
import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { ExceptionAuthentificationAutorisation } from '@/src/application/exceptions'
import {
  TypeContexteAccesAdministrationAdmin,
  TypeRessourceAdministrationAdmin,
} from '@/src/domaine/types/administration'
import { CODES_PERMISSIONS_RESSOURCES_ADMIN, ERRORS, t } from '@/src/messages'

const RESSOURCES_SUPER_ADMIN_DIRECTES: ReadonlySet<TypeRessourceAdministrationAdmin> =
  new Set(['admins', 'admin_requests', 'entreprises', 'users'])
const RESSOURCES_SUPER_ADMIN_SANS_IMPERSONATION: ReadonlySet<TypeRessourceAdministrationAdmin> =
  new Set([...RESSOURCES_SUPER_ADMIN_DIRECTES, 'settings'])

export class ServiceAdministrationAdminSecurite {
  constructor(private readonly serviceAuthentification: ServiceAuthentification) {}

  public async obtenirContexteAcces(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    ressource: TypeRessourceAdministrationAdmin
  ): Promise<TypeContexteAccesAdministrationAdmin> {
    const contexteSession =
      await this.serviceAuthentification.obtenirContexteDepuisJetonAcces(jetonAcces)
    const utilisateur = contexteSession.utilisateur
    const role = String(utilisateur.role || '').toUpperCase()
    const impersonationActive = role === 'SUPER_ADMIN' && Boolean(impersonation?.adminId)
    const ressourceSuperAdminDirecte = this.estRessourceSuperAdminDirecte(ressource)
    const ressourceSuperAdminSansImpersonation =
      this.estRessourceSuperAdminSansImpersonation(ressource)
    let adminId = ''

    if (role === 'SUPER_ADMIN' && ressourceSuperAdminSansImpersonation) {
      await this.serviceAuthentification.exigerSecondeAuthSuperAdmin(jetonAcces)
      adminId = String(impersonation?.adminId || utilisateur.id).trim()
    } else if (role === 'ADMIN') {
      if (ressourceSuperAdminDirecte) {
        throw new ExceptionAuthentificationAutorisation(
          t(ERRORS.AUTH_PERMISSION_MANQUANTE)
        )
      }
      adminId = utilisateur.id
    } else if (impersonationActive) {
      await this.serviceAuthentification.exigerSecondeAuthSuperAdmin(jetonAcces)
      adminId = String(impersonation?.adminId || '').trim()
    } else {
      throw new ExceptionAuthentificationAutorisation(
        t(ERRORS.AUTH_PERMISSION_MANQUANTE)
      )
    }

    const permissions = Array.isArray(utilisateur.permissions)
      ? utilisateur.permissions
      : []

    const contexte: TypeContexteAccesAdministrationAdmin = {
      utilisateurId: utilisateur.id,
      role,
      permissions,
      superAdminSecondAuthRequired: Boolean(utilisateur.superAdminSecondAuthRequired),
      adminId,
      impersonationActive,
    }

    this.exigerPermission(contexte, ressource)
    return contexte
  }

  private exigerPermission(
    contexte: TypeContexteAccesAdministrationAdmin,
    ressource: TypeRessourceAdministrationAdmin
  ): void {
    if (
      contexte.role === 'SUPER_ADMIN' &&
      (contexte.impersonationActive ||
        this.estRessourceSuperAdminSansImpersonation(ressource))
    ) {
      return
    }

    const permissionRequise = CODES_PERMISSIONS_RESSOURCES_ADMIN[ressource]
    if (!permissionRequise) {
      return
    }

    const permissions = new Set(contexte.permissions)
    if (!permissions.has(permissionRequise)) {
      throw new ExceptionAuthentificationAutorisation(
        t(ERRORS.AUTH_PERMISSION_MANQUANTE),
        { permission: permissionRequise }
      )
    }
  }

  private estRessourceSuperAdminDirecte(
    ressource: TypeRessourceAdministrationAdmin
  ): boolean {
    return RESSOURCES_SUPER_ADMIN_DIRECTES.has(ressource)
  }

  private estRessourceSuperAdminSansImpersonation(
    ressource: TypeRessourceAdministrationAdmin
  ): boolean {
    return RESSOURCES_SUPER_ADMIN_SANS_IMPERSONATION.has(ressource)
  }
}
