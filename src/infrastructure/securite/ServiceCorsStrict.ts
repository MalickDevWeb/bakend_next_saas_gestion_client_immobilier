import { NextRequest, NextResponse } from 'next/server'
import { CODE_HTTP } from '@/src/messages'

export class ServiceCorsStrict {
  constructor(private readonly originesAutorisees: string[]) {}

  public traiterPreflight(requete: NextRequest): NextResponse {
    const origin = requete.headers.get('origin') || ''
    const reponse = new NextResponse(null, { status: CODE_HTTP.SANS_CONTENU })
    this.appliquerEntetesCors(reponse, origin)
    return reponse
  }

  public appliquerEntetesCors(reponse: NextResponse, origin: string): void {
    if (!origin) return
    if (!this.estOrigineAutorisee(origin)) return

    reponse.headers.set('Access-Control-Allow-Origin', origin)
    reponse.headers.set('Access-Control-Allow-Credentials', 'true')
    reponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
    reponse.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    reponse.headers.set('Vary', 'Origin')
  }

  public estRequeteInterdite(origin: string): boolean {
    if (!origin) return false
    return !this.estOrigineAutorisee(origin)
  }

  private estOrigineAutorisee(origin: string): boolean {
    return this.originesAutorisees.includes(origin)
  }
}
