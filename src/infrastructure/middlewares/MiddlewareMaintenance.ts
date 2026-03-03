import { NextRequest, NextResponse } from 'next/server'
import { InterfaceMiddlewareHttp } from '@/src/infrastructure/middlewares/InterfaceMiddlewareHttp'

export class MiddlewareMaintenance implements InterfaceMiddlewareHttp {
  private readonly routesAutorisees = new Set(['/api/sante', '/api/documentation'])

  public traiter(requete: NextRequest): NextResponse | null {
    const maintenanceActive = process.env.MAINTENANCE_ACTIVE === 'true'

    if (!maintenanceActive) {
      return null
    }

    if (this.routesAutorisees.has(requete.nextUrl.pathname)) {
      return null
    }

    return NextResponse.json(
      {
        message: 'Maintenance active. Veuillez reessayer plus tard.',
      },
      { status: 503 }
    )
  }
}
