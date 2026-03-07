#!/usr/bin/env node
import { Algorithm, hash } from '@node-rs/argon2'
import { PrismaClient } from '@prisma/client'
import { createHash } from 'node:crypto'
import path from 'node:path'
import {
  buildReportPaths,
  createRng,
  ensureDir,
  getReportsDir,
  humanDuration,
  nowIso,
  parseArgs,
  pickFrom,
  timestampToken,
  toBoolean,
  toInt,
  weightedPick,
  writeJsonFile,
} from './extreme-shared.mjs'

const prisma = new PrismaClient()

const ADMIN_PERMISSION_CODES = [
  'DASHBOARD_ACCEDER',
  'CLIENTS_GERER',
  'LOCATIONS_GERER',
  'PAIEMENTS_GERER',
  'DOCUMENTS_GERER',
  'PARAMETRES_GERER',
  'TRAVAUX_GERER',
  'IMPORTS_GERER',
  'NOTIFICATIONS_GERER',
  'PDF_EXPORTER',
]

const SUPER_ADMIN_PERMISSION_CODES = [
  'AUTH_GERER',
  'AUDIT_LIRE',
  'AUDIT_EXPORTER',
  'CONFIGURATION_GERER',
  'ADMINS_GERER',
  'ENTREPRISES_GERER',
  'UTILISATEURS_GERER',
  'SECURITE_GERER',
]

const USER_ACTIONS = [
  'LOGIN_SUCCESS',
  'LOGOUT',
  'PROFILE_UPDATED',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_DOWNLOADED',
  'PAYMENT_VIEWED',
  'SESSION_REFRESHED',
  'SECURITY_CHALLENGE_PASSED',
]

const ADMIN_ACTIONS = [
  'CLIENT_CREATED',
  'CLIENT_UPDATED',
  'CLIENT_BLOCKED',
  'DOCUMENT_VALIDATED',
  'PAYMENT_STATUS_CHANGED',
  'SECURITY_ALERT_REVIEWED',
  'PROFILE_SUSPENDED',
]

const SYSTEM_ACTIONS = [
  'SERVER_START',
  'SERVER_STOP',
  'SERVER_RECOVERY',
  'SLOW_REQUEST',
  'SYSTEM_ERROR',
  'SECURITY_ALERT',
  'QUEUE_BACKPRESSURE',
]

const CLIENT_STATUSES = [
  { weight: 58, value: 'active' },
  { weight: 14, value: 'suspended' },
  { weight: 12, value: 'blocked' },
  { weight: 16, value: 'pending_validation' },
]

const CLIENT_USER_STATUSES = {
  active: 'ACTIF',
  suspended: 'SUSPENDU',
  blocked: 'SUSPENDU',
  pending_validation: 'EN_ATTENTE',
}

const MONTHLY_PAYMENT_STATUSES = [
  { weight: 36, value: 'paid' },
  { weight: 12, value: 'partial' },
  { weight: 12, value: 'late' },
  { weight: 14, value: 'unpaid' },
  { weight: 8, value: 'cancelled' },
  { weight: 8, value: 'refunded' },
  { weight: 10, value: 'processing' },
]

const DOCUMENT_TYPES = ['identity', 'contract', 'invoice', 'proof', 'administrative']
const DOCUMENT_FORMATS = ['pdf', 'jpg', 'png', 'webp']
const MOBILE_USER_AGENTS = [
  'Mozilla/5.0 (Linux; Android 14; KYA Load Bot) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1',
]

function printHelp() {
  console.info(`Usage: node scripts/extreme-seed.mjs [options]

Options:
  --tag=<value>                     Tag unique du scenario (defaut: extreme-<timestamp>)
  --admins=<number>                Nombre d administrateurs (defaut: 5)
  --clients-per-admin=<number>     Nombre de clients par admin (defaut: 2000)
  --locations-per-client=<number>  Nombre de locations par client (defaut: 1)
  --documents-per-location=<number> Nombre de documents par location (defaut: 3)
  --payments-per-location=<number> Nombre de paiements mensuels par location (defaut: 4)
  --sessions-per-client=<number>   Nombre de sessions auth par client (defaut: 2)
  --attempts-per-client=<number>   Nombre de tentatives de connexion par client (defaut: 4)
  --user-audits-per-client=<number>  Logs utilisateur par client (defaut: 8)
  --admin-audits-per-client=<number> Logs admin/systeme par client (defaut: 5)
  --notifications-per-client=<number> Notifications par client (defaut: 1)
  --batch-size=<number>            Taille de lot createMany (defaut: 200)
  --phone-base=<number>            Base telephone 9 chiffres pour isoler le scenario
  --cleanup                        Supprime d abord les donnees du tag
  --cleanup-only                   Nettoie puis quitte
  --plan                           Affiche la configuration puis quitte
  --help                           Affiche cette aide

Variables d environnement:
  EXTREME_ADMIN_PASSWORD
  EXTREME_CLIENT_PASSWORD
  EXTREME_SUPER_ADMIN_PASSWORD
`)
}

function buildConfig(args) {
  const tag = String(args.tag || process.env.EXTREME_TAG || `extreme-${timestampToken()}`).trim()
  const phoneBase = toInt(
    args['phone-base'] ?? process.env.EXTREME_PHONE_BASE,
    770000000 + (Date.now() % 29_900_000),
    700000000,
    799900000
  )
  return {
    tag,
    phoneBase,
    adminCount: toInt(args.admins ?? process.env.EXTREME_ADMIN_COUNT, 5, 1, 100),
    clientsPerAdmin: toInt(
      args['clients-per-admin'] ?? process.env.EXTREME_CLIENTS_PER_ADMIN,
      2000,
      1,
      20000
    ),
    locationsPerClient: toInt(
      args['locations-per-client'] ?? process.env.EXTREME_LOCATIONS_PER_CLIENT,
      1,
      1,
      5
    ),
    documentsPerLocation: toInt(
      args['documents-per-location'] ?? process.env.EXTREME_DOCUMENTS_PER_LOCATION,
      3,
      1,
      12
    ),
    paymentsPerLocation: toInt(
      args['payments-per-location'] ?? process.env.EXTREME_PAYMENTS_PER_LOCATION,
      4,
      1,
      12
    ),
    sessionsPerClient: toInt(
      args['sessions-per-client'] ?? process.env.EXTREME_SESSIONS_PER_CLIENT,
      2,
      0,
      10
    ),
    attemptsPerClient: toInt(
      args['attempts-per-client'] ?? process.env.EXTREME_ATTEMPTS_PER_CLIENT,
      4,
      0,
      20
    ),
    userAuditsPerClient: toInt(
      args['user-audits-per-client'] ?? process.env.EXTREME_USER_AUDITS_PER_CLIENT,
      8,
      0,
      30
    ),
    adminAuditsPerClient: toInt(
      args['admin-audits-per-client'] ?? process.env.EXTREME_ADMIN_AUDITS_PER_CLIENT,
      5,
      0,
      30
    ),
    notificationsPerClient: toInt(
      args['notifications-per-client'] ?? process.env.EXTREME_NOTIFICATIONS_PER_CLIENT,
      1,
      0,
      10
    ),
    suspiciousIpsPerAdmin: toInt(
      args['suspicious-ips-per-admin'] ?? process.env.EXTREME_SUSPICIOUS_IPS_PER_ADMIN,
      20,
      0,
      500
    ),
    globalSystemLogs: toInt(
      args['global-system-logs'] ?? process.env.EXTREME_GLOBAL_SYSTEM_LOGS,
      5000,
      0,
      200000
    ),
    batchSize: toInt(args['batch-size'] ?? process.env.EXTREME_BATCH_SIZE, 200, 25, 1000),
    cleanup: toBoolean(args.cleanup ?? process.env.EXTREME_CLEANUP, false),
    cleanupOnly: toBoolean(args['cleanup-only'], false),
    planOnly: toBoolean(args.plan, false),
    adminPassword: String(process.env.EXTREME_ADMIN_PASSWORD || 'ExtremeAdmin@123456'),
    clientPassword: String(process.env.EXTREME_CLIENT_PASSWORD || 'ExtremeClient@123456'),
    superAdminPassword: String(
      process.env.EXTREME_SUPER_ADMIN_PASSWORD || 'ExtremeSuperAdmin@123456'
    ),
  }
}

function buildPhone(index) {
  return String(index)
}

function hashedToken(value) {
  return createHash('sha256').update(value).digest('hex')
}

function buildIp(adminIndex, clientIndex, offset = 0) {
  const a = (adminIndex % 200) + 10
  const b = (Math.floor(clientIndex / 240) % 200) + 10
  const c = (clientIndex % 240) + 10
  const d = (offset % 200) + 10
  return `${a}.${b}.${c}.${d}`
}

function addCount(target, modelName, value) {
  target[modelName] = (target[modelName] || 0) + Number(value || 0)
}

async function createMany(prismaDelegate, modelName, data, counters) {
  if (!Array.isArray(data) || data.length === 0) return 0
  const result = await prismaDelegate.createMany({
    data,
    skipDuplicates: true,
  })
  addCount(counters, modelName, result.count)
  return result.count
}

async function cleanupScenario(prismaClient, tag) {
  const prefix = `${tag}-`
  console.info(`[EXTREME][CLEANUP] Suppression du scenario ${tag}...`)

  await prismaClient.jetonRefresh.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { sessionId: { startsWith: prefix } },
      ],
    },
  })
  await prismaClient.sessionAuthentification.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { utilisateurId: { startsWith: prefix } },
      ],
    },
  })
  await prismaClient.tentativeConnexion.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { utilisateurId: { startsWith: prefix } },
        { identifiant: { contains: tag } },
      ],
    },
  })
  await prismaClient.notification.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { utilisateurId: { startsWith: prefix } },
      ],
    },
  })
  await prismaClient.journalAudit.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { utilisateurId: { startsWith: prefix } },
        { details: { contains: tag } },
      ],
    },
  })
  await prismaClient.journalAuditAdmin.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { acteur: { startsWith: prefix } },
        { idCible: { startsWith: prefix } },
        { message: { contains: tag } },
      ],
    },
  })
  await prismaClient.ipBloquee.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { raison: { contains: tag } },
      ],
    },
  })
  await prismaClient.transactionPaiement.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { paiementMensuelId: { startsWith: prefix } },
      ],
    },
  })
  await prismaClient.paiementMensuel.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { locationId: { startsWith: prefix } },
      ],
    },
  })
  await prismaClient.paiementCaution.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { locationId: { startsWith: prefix } },
      ],
    },
  })
  await prismaClient.document.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { locationId: { startsWith: prefix } },
        { nom: { contains: tag } },
      ],
    },
  })
  await prismaClient.location.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { clientId: { startsWith: prefix } },
      ],
    },
  })
  await prismaClient.client.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { cni: { contains: tag } },
        { email: { contains: tag } },
      ],
    },
  })
  await prismaClient.permissionUtilisateur.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { utilisateurId: { startsWith: prefix } },
      ],
    },
  })
  await prismaClient.paiementAbonnementAdmin.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { adminId: { startsWith: prefix } },
        { entrepriseId: { startsWith: prefix } },
      ],
    },
  })
  await prismaClient.statutAbonnementAdmin.deleteMany({
    where: {
      adminId: { startsWith: prefix },
    },
  })
  await prismaClient.parametreAdmin.deleteMany({
    where: {
      adminId: { startsWith: prefix },
    },
  })
  await prismaClient.admin.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { utilisateurId: { startsWith: prefix } },
        { entrepriseId: { startsWith: prefix } },
        { nom: { contains: tag } },
      ],
    },
  })
  await prismaClient.entreprise.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { nom: { contains: tag } },
      ],
    },
  })
  await prismaClient.demandeAdmin.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { email: { contains: tag } },
        { nomEntreprise: { contains: tag } },
      ],
    },
  })
  await prismaClient.utilisateur.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { email: { contains: tag } },
      ],
    },
  })

  console.info(`[EXTREME][CLEANUP] Scenario ${tag} supprime.`)
}

function buildManifestSkeleton(config) {
  return {
    version: 1,
    scenarioType: 'extreme-test-seed',
    tag: config.tag,
    startedAt: nowIso(),
    config,
    superAdmin: null,
    admins: [],
    counters: {},
    samples: {
      clientIds: [],
      locationIds: [],
      documentIds: [],
      monthlyPaymentIds: [],
    },
  }
}

async function seed() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const config = buildConfig(args)
  if (config.planOnly) {
    console.info(JSON.stringify(config, null, 2))
    return
  }

  const startedAt = Date.now()
  const rng = createRng(config.tag)
  const counters = {}
  const manifest = buildManifestSkeleton(config)
  const reportsDir = getReportsDir(import.meta.url)
  ensureDir(reportsDir)

  await prisma.$connect()

  if (config.cleanup || config.cleanupOnly) {
    await cleanupScenario(prisma, config.tag)
    if (config.cleanupOnly) {
      return
    }
  }

  console.info(
    `[EXTREME][SEED] Debut seed massif tag=${config.tag} admins=${config.adminCount} clients/admin=${config.clientsPerAdmin}`
  )

  const superAdminUserId = `${config.tag}-user-super-admin`
  const superAdminPhone = buildPhone(config.phoneBase + 1)
  const superAdminEmail = `${config.tag}.superadmin@kya.local`
  const superAdminHash = await hash(config.superAdminPassword, {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  })
  const adminHash = await hash(config.adminPassword, {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  })
  const clientHash = await hash(config.clientPassword, {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  })

  await createMany(
    prisma.utilisateur,
    'utilisateurs',
    [
      {
        id: superAdminUserId,
        telephone: superAdminPhone,
        email: superAdminEmail,
        motDePasseHache: superAdminHash,
        role: 'SUPER_ADMIN',
        statut: 'ACTIF',
        superAdminTotpActive: false,
      },
    ],
    counters
  )

  await createMany(
    prisma.permissionUtilisateur,
    'permissions_utilisateur',
    SUPER_ADMIN_PERMISSION_CODES.map((code, index) => ({
      id: `${config.tag}-perm-super-admin-${index + 1}`,
      utilisateurId: superAdminUserId,
      code,
      autorise: true,
    })),
    counters
  )

  manifest.superAdmin = {
    userId: superAdminUserId,
    phone: superAdminPhone,
    email: superAdminEmail,
    password: config.superAdminPassword,
  }

  for (let adminIndex = 1; adminIndex <= config.adminCount; adminIndex += 1) {
    const adminUserId = `${config.tag}-user-admin-${adminIndex}`
    const adminId = `${config.tag}-admin-${adminIndex}`
    const entrepriseId = `${config.tag}-entreprise-${adminIndex}`
    const adminPhone = buildPhone(config.phoneBase + 100 + adminIndex)
    const adminEmail = `${config.tag}.admin${adminIndex}@kya.local`
    const adminName = `Extreme Admin ${adminIndex}`
    const requestId = `${config.tag}-demande-admin-${adminIndex}`
    const modeAbonnement = adminIndex % 3 === 0 ? 'annual' : adminIndex % 2 === 0 ? 'premium' : 'monthly'
    const monthlyAmount = 5000 + adminIndex * 1500
    const annualAmount = monthlyAmount * 12
    const allowCustomAmount = adminIndex % 2 === 0

    await createMany(
      prisma.utilisateur,
      'utilisateurs',
      [
        {
          id: adminUserId,
          telephone: adminPhone,
          email: adminEmail,
          motDePasseHache: adminHash,
          role: 'ADMIN',
          statut: 'ACTIF',
          superAdminTotpActive: false,
        },
      ],
      counters
    )

    await createMany(
      prisma.permissionUtilisateur,
      'permissions_utilisateur',
      ADMIN_PERMISSION_CODES.map((code, index) => ({
        id: `${config.tag}-perm-admin-${adminIndex}-${index + 1}`,
        utilisateurId: adminUserId,
        code,
        autorise: true,
      })),
      counters
    )

    await createMany(
      prisma.entreprise,
      'entreprises',
      [
        {
          id: entrepriseId,
          nom: `Entreprise ${config.tag.toUpperCase()} ${adminIndex}`,
          adminId,
        },
      ],
      counters
    )

    await createMany(
      prisma.admin,
      'admins',
      [
        {
          id: adminId,
          utilisateurId: adminUserId,
          nomUtilisateur: adminPhone,
          nom: adminName,
          email: adminEmail,
          statut: 'ACTIF',
          entrepriseId,
          modeAbonnement,
          montantMensuelAbonnement: monthlyAmount,
          montantAnnuelAbonnement: annualAmount,
          autoriserMontantPersonnalise: allowCustomAmount,
          permissionTableauDeBord: true,
          permissionClients: true,
          permissionLocations: true,
          permissionPaiements: true,
          permissionDocuments: true,
          permissionParametres: true,
          permissionTravaux: true,
          permissionImports: true,
          permissionNotifications: true,
          permissionExportPdf: true,
        },
      ],
      counters
    )

    await createMany(
      prisma.demandeAdmin,
      'demandes_admin',
      [
        {
          id: requestId,
          nom: adminName,
          email: adminEmail,
          telephone: adminPhone,
          nomEntreprise: `Entreprise ${config.tag.toUpperCase()} ${adminIndex}`,
          statut: 'ACTIF',
          nomUtilisateur: adminPhone,
          motDePasse: config.adminPassword,
          paye: true,
          payeLe: new Date(),
        },
      ],
      counters
    )

    const currentMonth = new Date().toISOString().slice(0, 7)
    await createMany(
      prisma.statutAbonnementAdmin,
      'admin_payment_statuses',
      [
        {
          adminId,
          bloque: false,
          moisEnRetard: null,
          echeance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          moisRequis: currentMonth,
          moisCourant: currentMonth,
          joursGrace: 5,
          modeAbonnement,
          montantAttendu: modeAbonnement === 'annual' ? annualAmount : monthlyAmount,
          autoriserMontantLibre: allowCustomAmount,
        },
      ],
      counters
    )

    await createMany(
      prisma.paiementAbonnementAdmin,
      'admin_payments',
      [
        {
          id: `${config.tag}-admin-payment-${adminIndex}-current-pending`,
          adminId,
          entrepriseId,
          montant: modeAbonnement === 'annual' ? annualAmount : monthlyAmount,
          methode: adminIndex % 2 === 0 ? 'orange_money' : 'wave',
          mois: currentMonth,
          statut: 'pending',
          fournisseur: adminIndex % 2 === 0 ? 'orange' : 'wave',
          referenceFournisseur: `${config.tag}-provider-ref-${adminIndex}`,
          urlPaiement: `https://checkout.kya.local/${config.tag}/admin/${adminIndex}`,
          telephonePayeur: adminPhone,
          referenceTransaction: `${config.tag}-txn-admin-${adminIndex}`,
          note: `Scenario ${config.tag} pending admin payment`,
          modeAbonnement,
        },
        {
          id: `${config.tag}-admin-payment-${adminIndex}-previous-paid`,
          adminId,
          entrepriseId,
          montant: monthlyAmount,
          methode: 'cash',
          mois: '2025-12',
          statut: 'paid',
          fournisseur: 'manual',
          telephonePayeur: adminPhone,
          referenceTransaction: `${config.tag}-txn-admin-paid-${adminIndex}`,
          note: `Scenario ${config.tag} settled admin payment`,
          payeLe: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          approuveLe: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          approuvePar: superAdminUserId,
          modeAbonnement,
        },
      ],
      counters
    )

    await createMany(
      prisma.notification,
      'notifications',
      [
        {
          id: `${config.tag}-notification-admin-${adminIndex}-1`,
          utilisateurId: adminUserId,
          message: `Alerte securite scenario ${config.tag} admin ${adminIndex}`,
          type: 'security',
          estLue: false,
        },
        {
          id: `${config.tag}-notification-admin-${adminIndex}-2`,
          utilisateurId: adminUserId,
          message: `Rapport de charge pret pour admin ${adminIndex}`,
          type: 'performance',
          estLue: adminIndex % 2 === 0,
        },
      ],
      counters
    )

    manifest.admins.push({
      adminId,
      userId: adminUserId,
      entrepriseId,
      phone: adminPhone,
      email: adminEmail,
      password: config.adminPassword,
      sampleLocationId: `${config.tag}-location-${adminIndex}-1-1`,
      sampleClientId: `${config.tag}-client-${adminIndex}-1`,
    })

    console.info(
      `[EXTREME][SEED] Admin ${adminIndex}/${config.adminCount}: creation de ${config.clientsPerAdmin} clients...`
    )

    for (
      let batchStart = 0;
      batchStart < config.clientsPerAdmin;
      batchStart += config.batchSize
    ) {
      const batchSize = Math.min(config.batchSize, config.clientsPerAdmin - batchStart)
      const users = []
      const clients = []
      const locations = []
      const documents = []
      const monthlyPayments = []
      const paymentTransactions = []
      const deposits = []
      const sessions = []
      const refreshTokens = []
      const attempts = []
      const userAudits = []
      const notifications = []
      const adminAudits = []

      for (let batchOffset = 0; batchOffset < batchSize; batchOffset += 1) {
        const clientIndex = batchStart + batchOffset + 1
        const globalClientOrdinal = (adminIndex - 1) * config.clientsPerAdmin + clientIndex
        const clientId = `${config.tag}-client-${adminIndex}-${clientIndex}`
        const clientUserId = `${config.tag}-user-client-${adminIndex}-${clientIndex}`
        const clientPhone = buildPhone(config.phoneBase + 1000 + globalClientOrdinal)
        const clientEmail = `${config.tag}.client.${adminIndex}.${clientIndex}@kya.local`
        const clientStatus = weightedPick(rng, CLIENT_STATUSES)
        const baseDate = new Date(Date.now() - (globalClientOrdinal % 240) * 24 * 60 * 60 * 1000)
        const adminIp = buildIp(adminIndex, clientIndex, 1)
        const mobileAgent = pickFrom(MOBILE_USER_AGENTS, globalClientOrdinal)

        users.push({
          id: clientUserId,
          telephone: clientPhone,
          email: clientEmail,
          motDePasseHache: clientHash,
          role: 'UTILISATEUR',
          statut: CLIENT_USER_STATUSES[clientStatus],
          superAdminTotpActive: false,
        })

        clients.push({
          id: clientId,
          adminId: adminUserId,
          prenom: `Prenom${adminIndex}_${clientIndex}`,
          nom: `Nom${adminIndex}_${clientIndex}`,
          telephone: clientPhone,
          cni: String(config.phoneBase * 10000 + globalClientOrdinal),
          email: clientEmail,
          statut: clientStatus,
          creeLe: baseDate,
          misAJourLe: baseDate,
        })

        if (manifest.samples.clientIds.length < 25) {
          manifest.samples.clientIds.push(clientId)
        }

        for (let sessionIndex = 1; sessionIndex <= config.sessionsPerClient; sessionIndex += 1) {
          const sessionId = `${config.tag}-session-${adminIndex}-${clientIndex}-${sessionIndex}`
          const csrfToken = `${config.tag}-csrf-${adminIndex}-${clientIndex}-${sessionIndex}`
          const accessJti = `${config.tag}-access-jti-${adminIndex}-${clientIndex}-${sessionIndex}`
          const expiresAt = new Date(baseDate.getTime() + sessionIndex * 6 * 60 * 60 * 1000)
          sessions.push({
            id: sessionId,
            utilisateurId: clientUserId,
            jetonAccesJti: accessJti,
            jetonAccesExpireLe: new Date(baseDate.getTime() + sessionIndex * 45 * 60 * 1000),
            csrfToken,
            adresseIp: buildIp(adminIndex, clientIndex, sessionIndex),
            agentUtilisateur: mobileAgent,
            secondeAuthValideeLe: null,
            expireLe: expiresAt,
            revoqueeLe: null,
            compromissionDetecteeLe: sessionIndex === config.sessionsPerClient ? null : null,
            creeLe: baseDate,
            misAJourLe: baseDate,
          })
          refreshTokens.push({
            id: `${config.tag}-refresh-${adminIndex}-${clientIndex}-${sessionIndex}`,
            sessionId,
            hachageToken: hashedToken(`${config.tag}:${sessionId}:refresh`),
            expireLe: new Date(baseDate.getTime() + sessionIndex * 24 * 60 * 60 * 1000),
            utiliseLe: null,
            revoqueLe: null,
            remplaceParId: null,
            creeLe: baseDate,
          })
        }

        for (let attemptIndex = 1; attemptIndex <= config.attemptsPerClient; attemptIndex += 1) {
          const successful = attemptIndex % 4 !== 0
          attempts.push({
            id: `${config.tag}-attempt-${adminIndex}-${clientIndex}-${attemptIndex}`,
            identifiant: clientPhone,
            adresseIp: buildIp(adminIndex, clientIndex, 100 + attemptIndex),
            succes: successful,
            type: attemptIndex % 3 === 0 ? 'REFRESH' : attemptIndex % 2 === 0 ? 'SECOND_AUTH' : 'LOGIN',
            creeLe: new Date(baseDate.getTime() + attemptIndex * 60 * 1000),
            utilisateurId: clientUserId,
          })
        }

        for (let auditIndex = 1; auditIndex <= config.userAuditsPerClient; auditIndex += 1) {
          const action = pickFrom(USER_ACTIONS, globalClientOrdinal + auditIndex)
          const isError = action === 'SECURITY_CHALLENGE_PASSED' ? false : auditIndex % 7 === 0
          userAudits.push({
            id: `${config.tag}-audit-user-${adminIndex}-${clientIndex}-${auditIndex}`,
            utilisateurId: clientUserId,
            action,
            statut: isError ? 'ERROR' : 'SUCCESS',
            details: `scenario=${config.tag};client=${clientId};action=${action};admin=${adminId}`,
            adresseIp: buildIp(adminIndex, clientIndex, 150 + auditIndex),
            agentUtilisateur: mobileAgent,
            creeLe: new Date(baseDate.getTime() + auditIndex * 5 * 60 * 1000),
          })
        }

        for (let auditIndex = 1; auditIndex <= config.adminAuditsPerClient; auditIndex += 1) {
          const action = pickFrom(ADMIN_ACTIONS, globalClientOrdinal + auditIndex)
          adminAudits.push({
            id: `${config.tag}-audit-admin-${adminIndex}-${clientIndex}-${auditIndex}`,
            acteur: adminId,
            action,
            typeCible: 'client',
            idCible: clientId,
            message: `scenario=${config.tag};client=${clientId};admin=${adminId};action=${action}`,
            adresseIp: adminIp,
            creeLe: new Date(baseDate.getTime() + auditIndex * 7 * 60 * 1000),
            misAJourLe: new Date(baseDate.getTime() + auditIndex * 7 * 60 * 1000),
          })
        }

        for (
          let notificationIndex = 1;
          notificationIndex <= config.notificationsPerClient;
          notificationIndex += 1
        ) {
          notifications.push({
            id: `${config.tag}-notif-client-${adminIndex}-${clientIndex}-${notificationIndex}`,
            utilisateurId: clientUserId,
            message: `Notification ${notificationIndex} pour ${clientId} scenario ${config.tag}`,
            type: notificationIndex % 2 === 0 ? 'payment' : 'document',
            estLue: notificationIndex % 3 === 0,
            creeLe: new Date(baseDate.getTime() + notificationIndex * 10 * 60 * 1000),
            misAJourLe: new Date(baseDate.getTime() + notificationIndex * 10 * 60 * 1000),
          })
        }

        for (let locationIndex = 1; locationIndex <= config.locationsPerClient; locationIndex += 1) {
          const locationId = `${config.tag}-location-${adminIndex}-${clientIndex}-${locationIndex}`
          const locationDate = new Date(baseDate.getTime() - locationIndex * 24 * 60 * 60 * 1000)
          locations.push({
            id: locationId,
            clientId,
            typeBien: locationIndex % 2 === 0 ? 'house' : 'apartment',
            nomBien: `Bien ${adminIndex}-${clientIndex}-${locationIndex}`,
            loyerMensuel: 75000 + (globalClientOrdinal % 20) * 5000,
            dateDebut: locationDate,
            cautionMontantTotal: 150000 + (globalClientOrdinal % 10) * 25000,
            cautionMontantPaye: 50000 + (globalClientOrdinal % 5) * 10000,
            creeLe: locationDate,
            misAJourLe: locationDate,
          })

          if (manifest.samples.locationIds.length < 25) {
            manifest.samples.locationIds.push(locationId)
          }

          for (let documentIndex = 1; documentIndex <= config.documentsPerLocation; documentIndex += 1) {
            const documentId = `${config.tag}-document-${adminIndex}-${clientIndex}-${locationIndex}-${documentIndex}`
            const documentType = pickFrom(DOCUMENT_TYPES, globalClientOrdinal + documentIndex)
            const documentFormat = pickFrom(DOCUMENT_FORMATS, globalClientOrdinal + documentIndex)
            const documentDate = new Date(locationDate.getTime() + documentIndex * 12 * 60 * 60 * 1000)
            documents.push({
              id: documentId,
              locationId,
              nom: `${config.tag}-${documentType}-${clientIndex}-${documentIndex}.${documentFormat}`,
              type: documentType,
              url: `https://res.cloudinary.com/kya-extreme/upload/v1/${config.tag}/${documentId}.${documentFormat}`,
              dateAjout: documentDate,
              estSigne: documentIndex % 2 === 0,
              creeLe: documentDate,
              misAJourLe: documentDate,
            })
            if (manifest.samples.documentIds.length < 25) {
              manifest.samples.documentIds.push(documentId)
            }
          }

          for (
            let paymentIndex = 1;
            paymentIndex <= config.paymentsPerLocation;
            paymentIndex += 1
          ) {
            const paymentId = `${config.tag}-monthly-payment-${adminIndex}-${clientIndex}-${locationIndex}-${paymentIndex}`
            const paymentStatus = weightedPick(rng, MONTHLY_PAYMENT_STATUSES)
            const monthlyRent = 75000 + (globalClientOrdinal % 20) * 5000
            const dueDate = new Date(locationDate.getTime() + paymentIndex * 31 * 24 * 60 * 60 * 1000)
            let paidAmount = 0
            if (paymentStatus === 'paid') paidAmount = monthlyRent
            else if (paymentStatus === 'partial') paidAmount = Math.round(monthlyRent * 0.55)
            else if (paymentStatus === 'refunded') paidAmount = monthlyRent
            else if (paymentStatus === 'processing') paidAmount = Math.round(monthlyRent * 0.25)

            monthlyPayments.push({
              id: paymentId,
              locationId,
              periodeDebut: dueDate,
              periodeFin: new Date(dueDate.getTime() + 29 * 24 * 60 * 60 * 1000),
              dateEcheance: dueDate,
              montantDu: monthlyRent,
              montantPaye: paidAmount,
              statut: paymentStatus,
              creeLe: dueDate,
              misAJourLe: dueDate,
            })

            if (manifest.samples.monthlyPaymentIds.length < 25) {
              manifest.samples.monthlyPaymentIds.push(paymentId)
            }

            if (paymentStatus !== 'unpaid') {
              paymentTransactions.push({
                id: `${config.tag}-payment-transaction-${adminIndex}-${clientIndex}-${locationIndex}-${paymentIndex}-1`,
                paiementMensuelId: paymentId,
                montant: paidAmount > 0 ? paidAmount : Math.round(monthlyRent * 0.25),
                datePaiement: new Date(dueDate.getTime() + 2 * 24 * 60 * 60 * 1000),
                numeroRecu: `${config.tag}-REC-${adminIndex}-${clientIndex}-${locationIndex}-${paymentIndex}`,
                description: `scenario=${config.tag};payment=${paymentId};status=${paymentStatus}`,
                statut:
                  paymentStatus === 'late'
                    ? 'completed_late'
                    : paymentStatus === 'refunded'
                      ? 'refunded'
                      : paymentStatus === 'processing'
                        ? 'processing'
                        : paymentStatus === 'cancelled'
                          ? 'cancelled'
                          : 'completed',
                creeLe: dueDate,
                misAJourLe: dueDate,
              })
            }

            adminAudits.push({
              id: `${config.tag}-audit-payment-history-${adminIndex}-${clientIndex}-${locationIndex}-${paymentIndex}`,
              acteur: adminId,
              action: 'PAYMENT_STATUS_CHANGED',
              typeCible: 'payment',
              idCible: paymentId,
              message: `scenario=${config.tag};payment=${paymentId};status=${paymentStatus};penalty=${paymentStatus === 'late' ? '15' : '0'}`,
              adresseIp: adminIp,
              creeLe: dueDate,
              misAJourLe: dueDate,
            })
          }

          deposits.push({
            id: `${config.tag}-deposit-${adminIndex}-${clientIndex}-${locationIndex}`,
            locationId,
            montant: 50000 + (globalClientOrdinal % 5) * 5000,
            datePaiement: new Date(locationDate.getTime() + 6 * 24 * 60 * 60 * 1000),
            numeroRecu: `${config.tag}-DEP-${adminIndex}-${clientIndex}-${locationIndex}`,
            note: `scenario=${config.tag};deposit=${clientId}`,
            statut: clientIndex % 5 === 0 ? 'pending' : 'completed',
            creeLe: locationDate,
            misAJourLe: locationDate,
          })
        }
      }

      await createMany(prisma.utilisateur, 'utilisateurs', users, counters)
      await createMany(prisma.client, 'clients', clients, counters)
      await createMany(prisma.location, 'locations', locations, counters)
      await createMany(prisma.document, 'documents', documents, counters)
      await createMany(prisma.paiementMensuel, 'location_monthly_payments', monthlyPayments, counters)
      await createMany(prisma.transactionPaiement, 'payments', paymentTransactions, counters)
      await createMany(prisma.paiementCaution, 'deposits', deposits, counters)
      await createMany(prisma.sessionAuthentification, 'sessions_authentification', sessions, counters)
      await createMany(prisma.jetonRefresh, 'jetons_refresh', refreshTokens, counters)
      await createMany(prisma.tentativeConnexion, 'tentatives_connexion', attempts, counters)
      await createMany(prisma.journalAudit, 'journaux_audit', userAudits, counters)
      await createMany(prisma.notification, 'notifications', notifications, counters)
      await createMany(prisma.journalAuditAdmin, 'audit_logs', adminAudits, counters)

      console.info(
        `[EXTREME][SEED] Admin ${adminIndex}/${config.adminCount} lot ${batchStart + 1}-${batchStart + batchSize} termine`
      )
    }

    const blockedIps = []
    for (let blockedIndex = 1; blockedIndex <= config.suspiciousIpsPerAdmin; blockedIndex += 1) {
      blockedIps.push({
        id: `${config.tag}-blocked-ip-${adminIndex}-${blockedIndex}`,
        adresseIp: buildIp(adminIndex, blockedIndex, 220),
        raison: `scenario=${config.tag};admin=${adminId};reason=bruteforce_or_suspicious_activity`,
        creeLe: new Date(),
        misAJourLe: new Date(),
      })
    }
    await createMany(prisma.ipBloquee, 'blocked_ips', blockedIps, counters)
  }

  const globalSystemLogs = []
  for (let logIndex = 1; logIndex <= config.globalSystemLogs; logIndex += 1) {
    const action = pickFrom(SYSTEM_ACTIONS, logIndex)
    globalSystemLogs.push({
      id: `${config.tag}-global-log-${logIndex}`,
      acteur: logIndex % 2 === 0 ? manifest.superAdmin.userId : null,
      action,
      typeCible: action === 'SECURITY_ALERT' ? 'security' : 'system',
      idCible: null,
      message: `scenario=${config.tag};action=${action};responseMs=${50 + (logIndex % 500)};status=${logIndex % 17 === 0 ? 'error' : 'ok'}`,
      adresseIp: `10.${(logIndex % 200) + 10}.${(Math.floor(logIndex / 200) % 200) + 10}.${(logIndex % 150) + 20}`,
      creeLe: new Date(Date.now() - logIndex * 10 * 1000),
      misAJourLe: new Date(Date.now() - logIndex * 10 * 1000),
    })
  }
  await createMany(prisma.journalAuditAdmin, 'audit_logs', globalSystemLogs, counters)

  manifest.finishedAt = nowIso()
  manifest.durationMs = Date.now() - startedAt
  manifest.counters = counters

  const timestampedPath = buildReportPaths(import.meta.url, 'extreme-seed-manifest', config.tag).filePath
  const latestPath = path.join(getReportsDir(import.meta.url), 'extreme-last-seed.json')
  writeJsonFile(timestampedPath, manifest)
  writeJsonFile(latestPath, manifest)

  console.info(
    `[EXTREME][SEED] Termine en ${humanDuration(manifest.durationMs)}. Rapport: ${timestampedPath}`
  )
  console.info(
    `[EXTREME][SEED] Totaux: utilisateurs=${counters.utilisateurs || 0}, clients=${counters.clients || 0}, logs=${(counters.journaux_audit || 0) + (counters.audit_logs || 0)}`
  )
}

seed()
  .catch((error) => {
    console.error('[EXTREME][SEED] Echec:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
