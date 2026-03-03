import { NextRequest } from 'next/server'

export class ServiceProtectionCsrf {
  public verifier(requete: NextRequest): boolean {
    const tokenCookie = requete.cookies.get('kya_csrf_token')?.value || ''
    const tokenEntete = requete.headers.get('x-csrf-token') || ''
    if (!tokenCookie || !tokenEntete) return false
    return tokenCookie === tokenEntete
  }
}
