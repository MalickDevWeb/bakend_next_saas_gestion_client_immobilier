import { NextRequest, NextResponse } from 'next/server'
import { ConfigurationSecurite } from '@/src/coeur/configuration/ConfigurationSecurite'
import { PipelineMiddlewaresHttp, pipelineMiddlewaresHttp } from '@/src/infrastructure/middlewares/PipelineMiddlewaresHttp'
import { ServiceCorsStrict } from '@/src/infrastructure/securite/ServiceCorsStrict'
import { ServiceEntetesSecuriteHttp } from '@/src/infrastructure/securite/ServiceEntetesSecuriteHttp'
import { ServiceProtectionCsrf } from '@/src/infrastructure/securite/ServiceProtectionCsrf'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'

const PREFIXES_ROUTES_API = [
  '/api',
  '/authContext',
  '/auth',
  '/clients',
  '/documents',
  '/payments',
  '/deposits',
  '/work_items',
  '/settings',
  '/import_runs',
  '/notifications',
  '/undo-actions',
  '/admin_payments',
  '/audit_logs',
  '/blocked_ips',
  '/cloudinary',
]

export class MiddlewareGlobal {
  private readonly configurationSecurite: ConfigurationSecurite
  private readonly serviceCorsStrict: ServiceCorsStrict
  private readonly serviceEntetesSecuriteHttp = new ServiceEntetesSecuriteHttp()
  private readonly serviceProtectionCsrf = new ServiceProtectionCsrf()

  constructor(
    private readonly pipeline: PipelineMiddlewaresHttp = pipelineMiddlewaresHttp,
    configurationSecurite?: ConfigurationSecurite
  ) {
    this.configurationSecurite = configurationSecurite ?? new ConfigurationSecurite()
    this.serviceCorsStrict = new ServiceCorsStrict(
      this.configurationSecurite.originesCorsAutorisees()
    )
  }

  public async executer(requete: NextRequest): Promise<NextResponse> {
    const chemin = requete.nextUrl.pathname
    const origine = requete.headers.get('origin') || ''
    const origineLocale = requete.nextUrl.origin
    const estRouteApi = PREFIXES_ROUTES_API.some((prefixe) => chemin.startsWith(prefixe))

    if (estRouteApi && requete.method === 'OPTIONS') {
      const reponsePreflight = this.serviceCorsStrict.traiterPreflight(requete)
      return this.serviceEntetesSecuriteHttp.appliquer(reponsePreflight)
    }

    if (
      estRouteApi &&
      origine &&
      origine !== origineLocale &&
      this.serviceCorsStrict.estRequeteInterdite(origine)
    ) {
      const reponseInterdite = NextResponse.json(
        {
          message: t(ERRORS.SECURITE_ORIGINE_NON_AUTORISEE),
        },
        { status: CODE_HTTP.INTERDIT }
      )
      return this.serviceEntetesSecuriteHttp.appliquer(reponseInterdite)
    }

    const methodesAvecCorps = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
    const csrfExemptes = new Set(this.configurationSecurite.cheminsExemptesCsrf())
    if (
      estRouteApi &&
      methodesAvecCorps.has(requete.method.toUpperCase()) &&
      !csrfExemptes.has(chemin) &&
      !this.serviceProtectionCsrf.verifier(requete)
    ) {
      const reponseCsrf = NextResponse.json(
        {
          message: t(ERRORS.SECURITE_CSRF_INVALIDE),
          code: 'CSRF_INVALID',
        },
        { status: CODE_HTTP.INTERDIT }
      )
      return this.serviceEntetesSecuriteHttp.appliquer(reponseCsrf)
    }

    const reponsePipeline = await this.pipeline.executer(requete)
    const reponse = reponsePipeline ?? NextResponse.next()

    if (estRouteApi) {
      this.serviceCorsStrict.appliquerEntetesCors(reponse, origine)
    }

    return this.serviceEntetesSecuriteHttp.appliquer(reponse)
  }
}

export const middlewareGlobal = new MiddlewareGlobal()
