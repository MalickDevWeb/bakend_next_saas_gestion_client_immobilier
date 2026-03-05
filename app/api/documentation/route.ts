import { NextRequest, NextResponse } from 'next/server'
import { GenerateurSwagger } from '@/src/documentation/GenerateurSwagger'

function determinerOrigine(requete: NextRequest): string | undefined {
  const proto = requete.headers.get('x-forwarded-proto')
  const host = requete.headers.get('x-forwarded-host') || requete.headers.get('host')
  if (proto && host) return `${proto}://${host}`
  return requete.nextUrl.origin
}

export async function GET(requete: NextRequest) {
  return NextResponse.json(GenerateurSwagger.generer(determinerOrigine(requete)))
}
