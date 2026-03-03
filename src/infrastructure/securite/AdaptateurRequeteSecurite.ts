import { NextRequest } from 'next/server'
import { ServiceProtectionCsrf } from '@/src/infrastructure/securite/ServiceProtectionCsrf'
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
}
