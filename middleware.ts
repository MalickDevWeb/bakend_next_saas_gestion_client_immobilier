import { NextRequest } from 'next/server'
import { middlewareGlobal } from '@/src/infrastructure/middlewares/MiddlewareGlobal'

export async function middleware(requete: NextRequest) {
  return middlewareGlobal.executer(requete)
}

export const config = {
  matcher: [
    '/api/:path*',
    '/authContext/:path*',
    '/auth/:path*',
    '/clients/:path*',
    '/documents/:path*',
    '/payments/:path*',
    '/deposits/:path*',
    '/work_items/:path*',
    '/settings/:path*',
    '/import_runs/:path*',
    '/notifications/:path*',
    '/undo-actions/:path*',
    '/admin_payments/:path*',
    '/audit_logs/:path*',
    '/blocked_ips/:path*',
    '/cloudinary/:path*',
  ],
}
