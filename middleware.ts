import { NextRequest, NextResponse } from 'next/server'
import { pipelineMiddlewaresHttp } from '@/src/infrastructure/middlewares/PipelineMiddlewaresHttp'

export async function middleware(requete: NextRequest) {
  const reponse = await pipelineMiddlewaresHttp.executer(requete)
  return reponse ?? NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
