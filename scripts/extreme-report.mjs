#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  buildReportPaths,
  getReportsDir,
  latestFile,
  nowIso,
  parseArgs,
  readJsonFile,
  timestampToken,
  writeJsonFile,
} from './extreme-shared.mjs'

const prisma = new PrismaClient()

function printHelp() {
  console.info(`Usage: node scripts/extreme-report.mjs [options]

Options:
  --tag=<value>      Utilise les rapports et manifestes associes a ce tag
  --help             Affiche cette aide
`)
}

function sortGroupBy(rows, key) {
  return [...rows]
    .map((row) => ({
      value: row[key],
      count: row._count?._all || row._count || 0,
    }))
    .sort((left, right) => right.count - left.count)
}

async function loadDatabaseStats(tag) {
  const prefix = `${tag}-`
  const stats = {
    available: true,
    generatedAt: nowIso(),
    counts: {},
    distributions: {},
    samples: {},
  }

  try {
    const [
      utilisateurCount,
      adminCount,
      entrepriseCount,
      clientCount,
      locationCount,
      documentCount,
      monthlyPaymentCount,
      transactionCount,
      depositCount,
      notificationCount,
      auditCount,
      adminAuditCount,
      blockedIpCount,
      sessionCount,
      refreshCount,
      failedAttempts,
      successfulAttempts,
      adminPaymentsCount,
      adminPaymentStatusCount,
      clientStatuses,
      monthlyPaymentStatuses,
      documentTypes,
      userRoles,
      userStatuses,
      userActions,
      adminActions,
    ] = await Promise.all([
      prisma.utilisateur.count({ where: { id: { startsWith: prefix } } }),
      prisma.admin.count({ where: { id: { startsWith: prefix } } }),
      prisma.entreprise.count({ where: { id: { startsWith: prefix } } }),
      prisma.client.count({ where: { id: { startsWith: prefix } } }),
      prisma.location.count({ where: { id: { startsWith: prefix } } }),
      prisma.document.count({ where: { id: { startsWith: prefix } } }),
      prisma.paiementMensuel.count({ where: { id: { startsWith: prefix } } }),
      prisma.transactionPaiement.count({ where: { id: { startsWith: prefix } } }),
      prisma.paiementCaution.count({ where: { id: { startsWith: prefix } } }),
      prisma.notification.count({ where: { id: { startsWith: prefix } } }),
      prisma.journalAudit.count({ where: { id: { startsWith: prefix } } }),
      prisma.journalAuditAdmin.count({ where: { id: { startsWith: prefix } } }),
      prisma.ipBloquee.count({ where: { id: { startsWith: prefix } } }),
      prisma.sessionAuthentification.count({ where: { id: { startsWith: prefix } } }),
      prisma.jetonRefresh.count({ where: { id: { startsWith: prefix } } }),
      prisma.tentativeConnexion.count({
        where: {
          id: { startsWith: prefix },
          succes: false,
        },
      }),
      prisma.tentativeConnexion.count({
        where: {
          id: { startsWith: prefix },
          succes: true,
        },
      }),
      prisma.paiementAbonnementAdmin.count({ where: { id: { startsWith: prefix } } }),
      prisma.statutAbonnementAdmin.count({ where: { adminId: { startsWith: prefix } } }),
      prisma.client.groupBy({
        by: ['statut'],
        where: { id: { startsWith: prefix } },
        _count: { _all: true },
      }),
      prisma.paiementMensuel.groupBy({
        by: ['statut'],
        where: { id: { startsWith: prefix } },
        _count: { _all: true },
      }),
      prisma.document.groupBy({
        by: ['type'],
        where: { id: { startsWith: prefix } },
        _count: { _all: true },
      }),
      prisma.utilisateur.groupBy({
        by: ['role'],
        where: { id: { startsWith: prefix } },
        _count: { _all: true },
      }),
      prisma.utilisateur.groupBy({
        by: ['statut'],
        where: { id: { startsWith: prefix } },
        _count: { _all: true },
      }),
      prisma.journalAudit.groupBy({
        by: ['action'],
        where: { id: { startsWith: prefix } },
        _count: { _all: true },
      }),
      prisma.journalAuditAdmin.groupBy({
        by: ['action'],
        where: { id: { startsWith: prefix } },
        _count: { _all: true },
      }),
    ])

    stats.counts = {
      utilisateurs: utilisateurCount,
      admins: adminCount,
      entreprises: entrepriseCount,
      clients: clientCount,
      locations: locationCount,
      documents: documentCount,
      paiementsMensuels: monthlyPaymentCount,
      transactionsPaiement: transactionCount,
      depots: depositCount,
      notifications: notificationCount,
      journauxAuditUtilisateur: auditCount,
      journauxAuditAdmin: adminAuditCount,
      blockedIps: blockedIpCount,
      sessions: sessionCount,
      refreshTokens: refreshCount,
      tentativesConnexionEchouees: failedAttempts,
      tentativesConnexionReussies: successfulAttempts,
      paiementsAbonnementAdmin: adminPaymentsCount,
      statutsAbonnementAdmin: adminPaymentStatusCount,
    }

    stats.distributions = {
      clientStatuses: sortGroupBy(clientStatuses, 'statut'),
      monthlyPaymentStatuses: sortGroupBy(monthlyPaymentStatuses, 'statut'),
      documentTypes: sortGroupBy(documentTypes, 'type'),
      userRoles: sortGroupBy(userRoles, 'role'),
      userStatuses: sortGroupBy(userStatuses, 'statut'),
      topUserActions: sortGroupBy(userActions, 'action').slice(0, 10),
      topAdminActions: sortGroupBy(adminActions, 'action').slice(0, 10),
    }

    stats.samples = {
      latestBlockedIps: await prisma.ipBloquee.findMany({
        where: { id: { startsWith: prefix } },
        orderBy: { creeLe: 'desc' },
        take: 10,
        select: {
          adresseIp: true,
          raison: true,
          creeLe: true,
        },
      }),
      latestAdminAudits: await prisma.journalAuditAdmin.findMany({
        where: { id: { startsWith: prefix } },
        orderBy: { creeLe: 'desc' },
        take: 10,
        select: {
          action: true,
          typeCible: true,
          idCible: true,
          message: true,
          creeLe: true,
        },
      }),
    }
  } catch (error) {
    stats.available = false
    stats.error = error instanceof Error ? error.message : 'Unknown database error'
  }

  return stats
}

function buildMarkdown(report) {
  const db = report.database
  const loadReport = report.loadReport
  const lines = [
    '# Rapport Extreme Performance / Securite / Scalabilite',
    '',
    `- Tag scenario: \`${report.tag}\``,
    `- Genere le: ${report.generatedAt}`,
    '',
    '## Seed',
    '',
    `- Debut: ${report.seedManifest?.startedAt || 'N/A'}`,
    `- Fin: ${report.seedManifest?.finishedAt || 'N/A'}`,
    `- Admins simules: ${report.seedManifest?.config?.adminCount || 0}`,
    `- Clients par admin: ${report.seedManifest?.config?.clientsPerAdmin || 0}`,
    `- Total clients cibles: ${(report.seedManifest?.config?.adminCount || 0) * (report.seedManifest?.config?.clientsPerAdmin || 0)}`,
    '',
    '## Base de donnees',
    '',
  ]

  if (db.available) {
    for (const [key, value] of Object.entries(db.counts || {})) {
      lines.push(`- ${key}: ${value}`)
    }
    lines.push('')
    lines.push('### Distribution statuts clients')
    for (const row of db.distributions.clientStatuses || []) {
      lines.push(`- ${row.value}: ${row.count}`)
    }
    lines.push('')
    lines.push('### Distribution paiements mensuels')
    for (const row of db.distributions.monthlyPaymentStatuses || []) {
      lines.push(`- ${row.value}: ${row.count}`)
    }
  } else {
    lines.push(`- Stats base indisponibles: ${db.error || 'erreur inconnue'}`)
  }

  lines.push('')
  lines.push('## Charge et securite')
  lines.push('')

  if (loadReport) {
    lines.push(`- Base URL: ${loadReport.baseUrl}`)
    lines.push(`- Duree suite: ${loadReport.durationMs || 0} ms`)
    lines.push(`- Total requetes: ${loadReport.totals?.totalRequests || 0}`)
    lines.push(`- Succes: ${loadReport.totals?.totalSuccess || 0}`)
    lines.push(`- Erreurs: ${loadReport.totals?.totalErrors || 0}`)
    lines.push('')
    lines.push('### Scenarios')
    for (const [scenarioName, scenario] of Object.entries(loadReport.scenarios || {})) {
      lines.push(
        `- ${scenarioName}: req=${scenario.totalRequests || 0}, ok=${scenario.successCount || 0}, ko=${scenario.errorCount || 0}, p95=${scenario.latency?.p95Ms || 0} ms, max=${scenario.latency?.maxMs || 0} ms`
      )
    }
    lines.push('')
    lines.push('### Chaos')
    for (const chaos of loadReport.chaos || []) {
      lines.push(
        `- ${chaos.name}: ${chaos.skipped ? `ignore (${chaos.reason})` : `outage=${chaos.outageDetected}, recovery=${chaos.recoveryDetected}`}`
      )
    }
    lines.push('')
    lines.push('### Requetes les plus lentes')
    const slowest = Object.values(loadReport.scenarios || {})
      .flatMap((scenario) => scenario?.slowestRequests || [])
      .sort((left, right) => right.durationMs - left.durationMs)
      .slice(0, 10)
    for (const item of slowest) {
      lines.push(`- ${item.method} ${item.endpoint}: ${item.durationMs} ms (status ${item.status})`)
    }
  } else {
    lines.push('- Rapport de charge non trouve.')
  }

  lines.push('')
  lines.push('## Conclusion')
  lines.push('')
  lines.push(
    `- Le dispositif couvre generation massive de donnees, tentatives de brute force, acces non autorises, charge lecture/ecriture, stress et hooks chaos optionnels.`
  )
  lines.push(
    `- Pour un test a tres haute intensite (1000 a 10000 sessions actives), augmente les parametres du runner et execute la suite sur une machine dediee.`
  )

  return `${lines.join('\n')}\n`
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const reportsDir = getReportsDir(import.meta.url)
  const tag = String(args.tag || process.env.EXTREME_TAG || '').trim()
  const seedManifestPath =
    tag.length > 0
      ? buildReportPaths(import.meta.url, 'extreme-seed-manifest', tag).filePath
      : path.join(reportsDir, 'extreme-last-seed.json')
  const loadReportPath =
    tag.length > 0
      ? buildReportPaths(import.meta.url, 'extreme-load-report-latest', tag).filePath
      : latestFile(reportsDir, 'extreme-load-report-latest-') || latestFile(reportsDir, 'extreme-load-report-')

  const seedManifest = readJsonFile(seedManifestPath)
  if (!seedManifest) {
    throw new Error('Impossible de trouver le manifest de seed extreme.')
  }

  const loadReport = loadReportPath ? readJsonFile(loadReportPath) : null
  const database = await loadDatabaseStats(seedManifest.tag)

  const report = {
    version: 1,
    scenarioType: 'extreme-consolidated-report',
    tag: seedManifest.tag,
    generatedAt: nowIso(),
    seedManifest,
    loadReport,
    database,
  }

  const outputTag = `${seedManifest.tag}-${timestampToken()}`
  const jsonPath = buildReportPaths(import.meta.url, 'extreme-summary-report', outputTag).filePath
  const mdPath = buildReportPaths(import.meta.url, 'extreme-summary-report', outputTag, 'md').filePath
  const latestJsonPath = buildReportPaths(import.meta.url, 'extreme-summary-report-latest', seedManifest.tag).filePath
  const latestMdPath = buildReportPaths(import.meta.url, 'extreme-summary-report-latest', seedManifest.tag, 'md').filePath

  writeJsonFile(jsonPath, report)
  writeJsonFile(latestJsonPath, report)
  const markdown = buildMarkdown(report)
  writeFileSync(mdPath, markdown, 'utf8')
  writeFileSync(latestMdPath, markdown, 'utf8')

  console.info(`[EXTREME][REPORT] Rapport JSON: ${jsonPath}`)
  console.info(`[EXTREME][REPORT] Rapport Markdown: ${mdPath}`)
}

main()
  .catch((error) => {
    console.error('[EXTREME][REPORT] Echec:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
