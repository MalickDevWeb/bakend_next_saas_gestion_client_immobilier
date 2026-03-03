import { NextRequest, NextResponse } from 'next/server'
import { InterfaceMiddlewareHttp } from '@/src/infrastructure/middlewares/InterfaceMiddlewareHttp'

export class MiddlewareJournalisation implements InterfaceMiddlewareHttp {
  public traiter(requete: NextRequest): NextResponse | null {
    if (requete.nextUrl.pathname.startsWith('/api')) {
      console.info(
        `[MIDDLEWARE] ${requete.method} ${requete.nextUrl.pathname}`
      )
    }

    return null
  }
}
