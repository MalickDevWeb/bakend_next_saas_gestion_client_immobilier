import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { lireDernierAutoExportAudit } from '@/src/infrastructure/http/exportAuditLogs'
import { lirePolitiquePlateforme } from '@/src/infrastructure/http/politiquePlateforme'

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
    await exigerSuperAdminAvecSecondeAuth(requete)

    const politique = await lirePolitiquePlateforme(conteneurDependances.prisma)
    const dernierExport = await lireDernierAutoExportAudit(conteneurDependances.prisma)
    const intervalHours = Math.max(1, Number(politique.auditCompliance.autoExportIntervalHours || 1))
    const intervalMs = intervalHours * 60 * 60 * 1000
    const lastGeneratedAt = dernierExport.meta?.generatedAt
      ? new Date(dernierExport.meta.generatedAt).getTime()
      : 0
    const nextDueAt =
      lastGeneratedAt > 0 ? new Date(lastGeneratedAt + intervalMs).toISOString() : null
    const due = politique.auditCompliance.autoExportEnabled
      ? !lastGeneratedAt || Date.now() >= lastGeneratedAt + intervalMs
      : false

    return conteneurDependances.reponseHttp.succes({
      enabled: politique.auditCompliance.autoExportEnabled,
      format: politique.auditCompliance.autoExportFormat,
      intervalHours,
      cronSecretConfigured: Boolean(conteneurDependances.configurationSecurite.cleCronAutoExportAudit()),
      endpointPath: '/api/audit_logs/auto-export',
      headerName: 'x-cron-secret',
      due,
      nextDueAt,
      lastExport: dernierExport.meta,
    })
  }
)
