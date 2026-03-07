import { NextRequest, NextResponse } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { lireDernierAutoExportAudit } from '@/src/infrastructure/http/exportAuditLogs'

function autoriserParSecretCron(requete: NextRequest): boolean {
  const secretConfigure = conteneurDependances.configurationSecurite.cleCronAutoExportAudit()
  if (!secretConfigure) return false
  const secretRecu = String(requete.headers.get('x-cron-secret') || '').trim()
  if (!secretRecu) return false
  return secretRecu === secretConfigure
}

async function exigerSuperAdminAvecSecondeAuth(requete: NextRequest): Promise<void> {
  const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
  const utilisateur = await conteneurDependances.serviceAuthentification.exigerSecondeAuthSuperAdmin(
    jetonAcces
  )
  const role = String(utilisateur.role || '').toUpperCase()
  if (role !== 'SUPER_ADMIN') {
    throw new ErreurHttp(CODE_HTTP.INTERDIT, t(ERRORS.AUTH_ACCES_SUPER_ADMIN))
  }
}

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const autoriseCron = autoriserParSecretCron(requete)
    if (!autoriseCron) {
      await exigerSuperAdminAvecSecondeAuth(requete)
    }

    const { meta, payload } = await lireDernierAutoExportAudit(conteneurDependances.prisma)
    if (!meta || !payload) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, 'Aucun auto-export audit disponible')
    }

    return new NextResponse(payload, {
      status: 200,
      headers: {
        'content-type':
          meta.format === 'json'
            ? 'application/json; charset=utf-8'
            : 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${meta.fileName}"`,
        'x-kya-audit-export-generated-at': meta.generatedAt,
        'x-kya-audit-export-checksum-sha256': meta.checksumSha256,
        'x-kya-audit-export-mode': meta.modeExecution,
      },
    })
  }
)
