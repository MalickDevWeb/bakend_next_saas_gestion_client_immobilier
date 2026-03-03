import { NextResponse } from 'next/server'
import { GenerateurSwagger } from '@/src/documentation/GenerateurSwagger'

export async function GET() {
  return NextResponse.json(GenerateurSwagger.generer())
}
