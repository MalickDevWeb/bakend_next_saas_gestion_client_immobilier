import { NextResponse } from 'next/server'

export class ServiceEntetesSecuriteHttp {
  public appliquer(reponse: NextResponse): NextResponse {
    reponse.headers.set('X-Content-Type-Options', 'nosniff')
    reponse.headers.set('X-Frame-Options', 'DENY')
    reponse.headers.set('Referrer-Policy', 'no-referrer')
    reponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    reponse.headers.set(
      'Content-Security-Policy',
      "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    )
    reponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    reponse.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
    reponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    return reponse
  }
}
