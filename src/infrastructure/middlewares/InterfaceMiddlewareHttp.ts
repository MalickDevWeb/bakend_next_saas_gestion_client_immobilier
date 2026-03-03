import { NextRequest, NextResponse } from 'next/server'

export interface InterfaceMiddlewareHttp {
  traiter(requete: NextRequest): Promise<NextResponse | null> | NextResponse | null
}
