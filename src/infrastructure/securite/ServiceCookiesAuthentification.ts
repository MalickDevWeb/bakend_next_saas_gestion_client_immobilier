import { NextResponse } from 'next/server'
import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'

type TypeOptionsCookies = {
  modeSecurise: boolean
  sameSite: 'strict' | 'lax' | 'none'
}

export class ServiceCookiesAuthentification {
  constructor(private readonly options: TypeOptionsCookies) {}

  private buildCookieOptions(path: string, maxAge: number, httpOnly: boolean) {
    // Même si l'env n'est pas "production", on force Secure quand SameSite=None pour
    // éviter les rejets navigateur et rester cohérent sécurité.
    const sameSite = this.options.sameSite
    const secure = this.options.modeSecurise || sameSite === 'none'
    return {
      httpOnly,
      secure,
      sameSite,
      path,
      maxAge,
    } as const
  }

  public ecrireCookiesConnexion(
    reponse: NextResponse,
    jetonAcces: string,
    jetonRefresh: string,
    csrfToken: string,
    dureeJetonAccesSecondes: number,
    dureeJetonRefreshSecondes: number
  ): void {
    reponse.cookies.set('kya_access_token', jetonAcces, this.buildCookieOptions('/', dureeJetonAccesSecondes, true))

    reponse.cookies.set(
      'kya_refresh_token',
      jetonRefresh,
      this.buildCookieOptions('/api/authContext/rafraichir', dureeJetonRefreshSecondes, true)
    )

    reponse.cookies.set('kya_csrf_token', csrfToken, this.buildCookieOptions('/', dureeJetonRefreshSecondes, false))
  }

  public ecrireCookiesRafraichissement(
    reponse: NextResponse,
    jetonAcces: string,
    jetonRefresh: string,
    csrfToken: string,
    dureeJetonAccesSecondes: number,
    dureeJetonRefreshSecondes: number
  ): void {
    this.ecrireCookiesConnexion(
      reponse,
      jetonAcces,
      jetonRefresh,
      csrfToken,
      dureeJetonAccesSecondes,
      dureeJetonRefreshSecondes
    )
  }

  public ecrireCookieImpersonation(
    reponse: NextResponse,
    etat: DtoEtatImpersonation,
    dureeSecondes: number
  ): void {
    const valeur = Buffer.from(JSON.stringify(etat || null), 'utf8').toString('base64url')
    reponse.cookies.set('kya_impersonation', valeur, {
      httpOnly: true,
      secure: this.options.modeSecurise,
      sameSite: this.options.sameSite,
      path: '/',
      maxAge: dureeSecondes,
    })
  }

  public nettoyerCookieImpersonation(reponse: NextResponse): void {
    reponse.cookies.set('kya_impersonation', '', {
      httpOnly: true,
      secure: this.options.modeSecurise,
      sameSite: this.options.sameSite,
      path: '/',
      maxAge: 0,
    })
  }

  public nettoyerCookies(reponse: NextResponse): void {
    reponse.cookies.set('kya_access_token', '', {
      httpOnly: true,
      secure: this.options.modeSecurise,
      sameSite: this.options.sameSite,
      path: '/',
      maxAge: 0,
    })
    reponse.cookies.set('kya_refresh_token', '', {
      httpOnly: true,
      secure: this.options.modeSecurise,
      sameSite: this.options.sameSite,
      path: '/api/authContext/rafraichir',
      maxAge: 0,
    })
    reponse.cookies.set('kya_csrf_token', '', {
      httpOnly: false,
      secure: this.options.modeSecurise,
      sameSite: this.options.sameSite,
      path: '/',
      maxAge: 0,
    })
    this.nettoyerCookieImpersonation(reponse)
  }
}
