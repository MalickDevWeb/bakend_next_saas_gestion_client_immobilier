import { NextRequest } from 'next/server'
import { middlewareGlobal } from '@/src/infrastructure/middlewares/MiddlewareGlobal'

export async function middleware(requete: NextRequest) {
  return middlewareGlobal.executer(requete)
}

export const config = {
  matcher: ['/api/:path*', '/authContext/:path*', '/auth/:path*'],
}
