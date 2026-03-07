import { createHash } from 'crypto'
import { PrismaClient } from '@prisma/client'

export type TypeFormatExportAudit = 'csv' | 'json'
export type TypeModeExecutionAutoExportAudit = 'CRON_SECRET' | 'AUTH_SUPER_ADMIN'

export type TypeLigneAutoExportAudit = {
  logSource: 'admin_audit' | 'security_audit'
  id: string
  createdAt: string
  actor?: string
  userId?: string
  action?: string
  status?: string
  targetType?: string
  targetId?: string
  message?: string
  details?: string
  ipAddress?: string
  userAgent?: string
}

export type TypeMetaAutoExportAudit = {
  generatedAt: string
  count: number
  adminAuditCount: number
  securityAuditCount: number
  format: TypeFormatExportAudit
  fileName: string
  checksumSha256: string
  modeExecution: TypeModeExecutionAutoExportAudit
}

const CLE_META_AUTO_EXPORT_AUDIT = 'audit_auto_export_meta'
const CLE_PAYLOAD_AUTO_EXPORT_AUDIT = 'audit_auto_export_payload'
const SCOPE_CLE_GLOBAL = 'GLOBAL'

export function normaliserFormatExportAudit(valeur: string | null | undefined): TypeFormatExportAudit {
  return String(valeur || '').trim().toLowerCase() === 'json' ? 'json' : 'csv'
}

export function creerNomFichierExportAudit(
  format: TypeFormatExportAudit,
  generatedAt = new Date().toISOString(),
  prefix = 'audit_logs'
): string {
  return `${prefix}_${generatedAt.replace(/[:.]/g, '-')}.${format}`
}

function echapperCsv(valeur: unknown): string {
  return `"${String(valeur ?? '').replace(/"/g, '""')}"`
}

export function genererContenuExportAudit(
  journaux: Record<string, unknown>[],
  format: TypeFormatExportAudit
): string {
  if (format === 'json') {
    return JSON.stringify(journaux, null, 2)
  }

  const colonnes = ['id', 'createdAt', 'actor', 'action', 'targetType', 'targetId', 'message', 'ipAddress']
  const lignes = journaux.map((ligne) =>
    colonnes.map((colonne) => echapperCsv((ligne as Record<string, unknown>)[colonne])).join(',')
  )
  return [colonnes.join(','), ...lignes].join('\n')
}

export function calculerChecksumExportAudit(contenu: string): string {
  return createHash('sha256').update(contenu).digest('hex')
}

export function mapperJournalAuditAdminPourExport(element: {
  id: string
  acteur: string | null
  action: string | null
  typeCible: string | null
  idCible: string | null
  message: string | null
  adresseIp: string | null
  creeLe: Date
}): Record<string, unknown> {
  return {
    id: element.id,
    actor: element.acteur || undefined,
    action: element.action || undefined,
    targetType: element.typeCible || undefined,
    targetId: element.idCible || undefined,
    message: element.message || undefined,
    ipAddress: element.adresseIp || undefined,
    createdAt: element.creeLe.toISOString(),
  }
}

export function mapperJournalAuditAdminPourAutoExport(element: {
  id: string
  acteur: string | null
  action: string | null
  typeCible: string | null
  idCible: string | null
  message: string | null
  adresseIp: string | null
  creeLe: Date
}): TypeLigneAutoExportAudit {
  return {
    logSource: 'admin_audit',
    id: element.id,
    createdAt: element.creeLe.toISOString(),
    actor: element.acteur || undefined,
    action: element.action || undefined,
    targetType: element.typeCible || undefined,
    targetId: element.idCible || undefined,
    message: element.message || undefined,
    ipAddress: element.adresseIp || undefined,
  }
}

export function mapperJournalAuditSecuritePourAutoExport(element: {
  id: string
  action: string
  statut: string
  details: string | null
  adresseIp: string | null
  agentUtilisateur: string | null
  creeLe: Date
  utilisateurId: string | null
}): TypeLigneAutoExportAudit {
  return {
    logSource: 'security_audit',
    id: element.id,
    createdAt: element.creeLe.toISOString(),
    actor: element.utilisateurId || 'security',
    userId: element.utilisateurId || undefined,
    action: element.action,
    status: element.statut,
    message: element.details || undefined,
    details: element.details || undefined,
    ipAddress: element.adresseIp || undefined,
    userAgent: element.agentUtilisateur || undefined,
  }
}

export function genererContenuAutoExportAudit(
  lignes: TypeLigneAutoExportAudit[],
  format: TypeFormatExportAudit
): string {
  if (format === 'json') {
    return JSON.stringify(lignes, null, 2)
  }

  const colonnes = [
    'logSource',
    'id',
    'createdAt',
    'actor',
    'userId',
    'action',
    'status',
    'targetType',
    'targetId',
    'message',
    'details',
    'ipAddress',
    'userAgent',
  ]
  const lignesCsv = lignes.map((ligne) =>
    colonnes.map((colonne) => echapperCsv((ligne as Record<string, unknown>)[colonne])).join(',')
  )
  return [colonnes.join(','), ...lignesCsv].join('\n')
}

async function enregistrerConfigurationTexte(
  prisma: PrismaClient,
  cle: string,
  valeurTexte: string
): Promise<void> {
  await prisma.configurationSysteme.upsert({
    where: {
      cle_scopeCle: {
        cle,
        scopeCle: SCOPE_CLE_GLOBAL,
      },
    },
    create: {
      cle,
      scopeCle: SCOPE_CLE_GLOBAL,
      portee: 'GLOBAL',
      adminId: null,
      typeValeur: 'STRING',
      valeurTexte,
      valeurNombre: null,
      valeurBooleen: null,
      origine: 'CUSTOM',
      verrouille: false,
    },
    update: {
      portee: 'GLOBAL',
      adminId: null,
      typeValeur: 'STRING',
      valeurTexte,
      valeurNombre: null,
      valeurBooleen: null,
      origine: 'CUSTOM',
      verrouille: false,
    },
  })
}

async function lireConfigurationTexte(prisma: PrismaClient, cle: string): Promise<string | null> {
  const element = await prisma.configurationSysteme.findUnique({
    where: {
      cle_scopeCle: {
        cle,
        scopeCle: SCOPE_CLE_GLOBAL,
      },
    },
  })
  return element?.valeurTexte || null
}

export async function sauvegarderDernierAutoExportAudit(
  prisma: PrismaClient,
  contenu: string,
  meta: TypeMetaAutoExportAudit
): Promise<void> {
  await Promise.all([
    enregistrerConfigurationTexte(prisma, CLE_PAYLOAD_AUTO_EXPORT_AUDIT, contenu),
    enregistrerConfigurationTexte(prisma, CLE_META_AUTO_EXPORT_AUDIT, JSON.stringify(meta)),
  ])
}

export async function lireDernierAutoExportAudit(
  prisma: PrismaClient
): Promise<{ meta: TypeMetaAutoExportAudit | null; payload: string | null }> {
  const [metaTexte, payload] = await Promise.all([
    lireConfigurationTexte(prisma, CLE_META_AUTO_EXPORT_AUDIT),
    lireConfigurationTexte(prisma, CLE_PAYLOAD_AUTO_EXPORT_AUDIT),
  ])

  let meta: TypeMetaAutoExportAudit | null = null
  if (metaTexte) {
    try {
      const brute = JSON.parse(metaTexte) as Partial<TypeMetaAutoExportAudit>
      if (
        brute &&
        typeof brute === 'object' &&
        typeof brute.generatedAt === 'string' &&
        (brute.format === 'csv' || brute.format === 'json') &&
        typeof brute.fileName === 'string' &&
        typeof brute.checksumSha256 === 'string' &&
        (brute.modeExecution === 'CRON_SECRET' || brute.modeExecution === 'AUTH_SUPER_ADMIN')
      ) {
        meta = {
          generatedAt: brute.generatedAt,
          count: Math.max(0, Number(brute.count || 0)),
          adminAuditCount: Math.max(0, Number(brute.adminAuditCount || brute.count || 0)),
          securityAuditCount: Math.max(0, Number(brute.securityAuditCount || 0)),
          format: brute.format,
          fileName: brute.fileName,
          checksumSha256: brute.checksumSha256,
          modeExecution: brute.modeExecution,
        }
      }
    } catch {
      meta = null
    }
  }

  return { meta, payload }
}
