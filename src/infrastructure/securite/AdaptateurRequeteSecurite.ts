import { NextRequest } from 'next/server'
import { ServiceProtectionCsrf } from '@/src/infrastructure/securite/ServiceProtectionCsrf'
import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { ObjetValeurIdentifiant, ObjetValeurTexteNonVide } from '@/src/domaine/objets_valeur'
import { t } from '@/src/messages'
import { ERRORS } from '@/src/messages/app/errors'
import {
  ExceptionAuthentification,
  ExceptionAuthentificationAutorisation,
} from '@/src/application/exceptions'

export class AdaptateurRequeteSecurite {
  constructor(private readonly serviceProtectionCsrf: ServiceProtectionCsrf) {}

  public extraireJetonAcces(requete: NextRequest): string {
    const depuisCookie = requete.cookies.get('kya_access_token')?.value
    if (depuisCookie) return depuisCookie

    const authorization = requete.headers.get('authorization') || ''
    if (authorization.startsWith('Bearer ')) {
      return authorization.slice(7)
    }

    throw new ExceptionAuthentification(t(ERRORS.AUTH_JETON_ACCES_MANQUANT))
  }

  public extraireJetonRefresh(requete: NextRequest): string {
    const depuisCookie = requete.cookies.get('kya_refresh_token')?.value
    if (!depuisCookie) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_REFRESH_MANQUANT))
    }
    return depuisCookie
  }

  public exigerCsrf(requete: NextRequest): void {
    if (!this.serviceProtectionCsrf.verifier(requete)) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.SECURITE_CSRF_INVALIDE), {
        code: 'CSRF_INVALID',
      })
    }
  }

  public lireImpersonation(requete: NextRequest): DtoEtatImpersonation {
    const valeur = requete.cookies.get('kya_impersonation')?.value
    if (!valeur) return null

    try {
      const json = Buffer.from(valeur, 'base64url').toString('utf8')
      const brut = JSON.parse(json) as {
        adminId?: string
        adminName?: string
        userId?: string | null
      } | null

      if (!brut || typeof brut !== 'object') return null
      const adminId = new ObjetValeurIdentifiant(String(brut.adminId || '')).valeur
      const adminName = new ObjetValeurTexteNonVide(
        String(brut.adminName || ''),
        'adminName',
        190
      ).valeur
      const userId = brut.userId ? new ObjetValeurIdentifiant(String(brut.userId)).valeur : null

      return {
        adminId,
        adminName,
        userId,
      }
    } catch {
      return null
    }
  }
}
