import { NextResponse } from 'next/server'

type TypeOptionsCookies = {
  modeSecurise: boolean
  sameSite: 'strict' | 'lax'
}

export class ServiceCookiesAuthentification {
  constructor(private readonly options: TypeOptionsCookies) {}

  public ecrireCookiesConnexion(
    reponse: NextResponse,
    jetonAcces: string,
    jetonRefresh: string,
    csrfToken: string,
    dureeJetonAccesSecondes: number,
    dureeJetonRefreshSecondes: number
  ): void {
    reponse.cookies.set('kya_access_token', jetonAcces, {
      httpOnly: true,
      secure: this.options.modeSecurise,
      sameSite: this.options.sameSite,
      path: '/',
      maxAge: dureeJetonAccesSecondes,
    })

    reponse.cookies.set('kya_refresh_token', jetonRefresh, {
      httpOnly: true,
      secure: this.options.modeSecurise,
      sameSite: this.options.sameSite,
      path: '/api/authContext/rafraichir',
      maxAge: dureeJetonRefreshSecondes,
    })

    reponse.cookies.set('kya_csrf_token', csrfToken, {
      httpOnly: false,
      secure: this.options.modeSecurise,
      sameSite: this.options.sameSite,
      path: '/',
      maxAge: dureeJetonRefreshSecondes,
    })
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
  }
}
