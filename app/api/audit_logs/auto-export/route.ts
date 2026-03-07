import { randomUUID } from 'crypto'
import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import {
  calculerChecksumExportAudit,
  creerNomFichierExportAudit,
  genererContenuAutoExportAudit,
  lireDernierAutoExportAudit,
  mapperJournalAuditAdminPourAutoExport,
  mapperJournalAuditSecuritePourAutoExport,
  sauvegarderDernierAutoExportAudit,
} from '@/src/infrastructure/http/exportAuditLogs'
import { lirePolitiquePlateforme } from '@/src/infrastructure/http/politiquePlateforme'

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

function lireBooleenParam(valeur: string | null | undefined, defautValeur = false): boolean {
  if (valeur == null) return defautValeur
  const normalise = String(valeur).trim().toLowerCase()
  if (!normalise) return defautValeur
  return ['1', 'true', 'yes', 'oui'].includes(normalise)
}

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const autoriseCron = autoriserParSecretCron(requete)
    if (!autoriseCron) {
      await exigerSuperAdminAvecSecondeAuth(requete)
    }

    const modeExecution = autoriseCron ? 'CRON_SECRET' : 'AUTH_SUPER_ADMIN'
    const politique = await lirePolitiquePlateforme(conteneurDependances.prisma)
    if (!politique.auditCompliance.autoExportEnabled) {
      return conteneurDependances.reponseHttp.succes({
        ok: true,
        enabled: false,
        executed: false,
        modeExecution,
      })
    }

    const force = lireBooleenParam(requete.nextUrl.searchParams.get('force'))
    const dernierExport = await lireDernierAutoExportAudit(conteneurDependances.prisma)
    const intervalMs =
      Math.max(1, Number(politique.auditCompliance.autoExportIntervalHours || 1)) *
      60 *
      60 *
      1000
    const lastGeneratedAt = dernierExport.meta?.generatedAt
      ? new Date(dernierExport.meta.generatedAt).getTime()
      : 0
    const maintenant = Date.now()
    const due = force || !lastGeneratedAt || maintenant - lastGeneratedAt >= intervalMs

    if (!due) {
      return conteneurDependances.reponseHttp.succes({
        ok: true,
        enabled: true,
        executed: false,
        modeExecution,
        skippedReason: 'NOT_DUE',
        lastExport: dernierExport.meta,
        nextDueAt: new Date(lastGeneratedAt + intervalMs).toISOString(),
      })
    }

    const journaux = await conteneurDependances.prisma.journalAuditAdmin.findMany({
      orderBy: { creeLe: 'desc' },
    })
    const journauxSecurite = await conteneurDependances.prisma.journalAudit.findMany({
      orderBy: { creeLe: 'desc' },
    })
    const lignesAdmin = journaux.map((journal) => mapperJournalAuditAdminPourAutoExport(journal))
    const lignesSecurite = journauxSecurite.map((journal) =>
      mapperJournalAuditSecuritePourAutoExport(journal)
    )
    const donnees = [...lignesAdmin, ...lignesSecurite].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    )
    const generatedAt = new Date().toISOString()
    const format = politique.auditCompliance.autoExportFormat
    const fileName = creerNomFichierExportAudit(format, generatedAt, 'audit_logs_auto')
    const contenu = genererContenuAutoExportAudit(donnees, format)
    const checksumSha256 = calculerChecksumExportAudit(contenu)
    const meta = {
      generatedAt,
      count: donnees.length,
      adminAuditCount: lignesAdmin.length,
      securityAuditCount: lignesSecurite.length,
      format,
      fileName,
      checksumSha256,
      modeExecution,
    } as const

    await sauvegarderDernierAutoExportAudit(conteneurDependances.prisma, contenu, meta)
    await conteneurDependances.prisma.journalAuditAdmin.create({
      data: {
        id: randomUUID(),
        acteur: autoriseCron ? 'system:cron' : 'super_admin',
        action: 'AUTO_AUDIT_EXPORT',
        typeCible: 'audit_logs+security_audits',
        idCible: fileName,
        message: `Auto-export ${format.toUpperCase()} genere (${lignesAdmin.length} audits admin, ${lignesSecurite.length} audits securite).`,
      },
    })

    return conteneurDependances.reponseHttp.succes({
      ok: true,
      enabled: true,
      executed: true,
      modeExecution,
      export: meta,
      nextDueAt: new Date(Date.parse(generatedAt) + intervalMs).toISOString(),
    })
  }
)
