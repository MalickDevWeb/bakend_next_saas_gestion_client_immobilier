import { NextRequest, NextResponse } from 'next/server'
import { InterfaceMiddlewareHttp } from '@/src/infrastructure/middlewares/InterfaceMiddlewareHttp'

export class MiddlewareJournalisation implements InterfaceMiddlewareHttp {
  public traiter(requete: NextRequest): NextResponse | null {
    void requete

    return null
  }
}
