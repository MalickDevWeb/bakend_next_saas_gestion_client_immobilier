#!/usr/bin/env node
import { exec as execCallback } from 'node:child_process'
import { promisify } from 'node:util'
import {
  buildReportPaths,
  getReportsDir,
  hostSnapshot,
  humanDuration,
  latestFile,
  nowIso,
  parseArgs,
  pickFrom,
  readJsonFile,
  sleep,
  summarizeLatencies,
  timestampToken,
  toInt,
  writeJsonFile,
} from './extreme-shared.mjs'

const exec = promisify(execCallback)

function printHelp() {
  console.info(`Usage: node scripts/extreme-load-security.mjs [options]

Options:
  --tag=<value>                 Utilise le manifest du seed associe a ce tag
  --base-url=<url>             URL du backend (defaut: BASE_URL ou http://localhost:3100)
  --active-users=<number>      Nombre de sessions admin actives (defaut: 120)
  --read-requests=<number>     Nombre de requetes lecture (defaut: activeUsers * 20)
  --write-requests=<number>    Nombre de requetes ecriture documents (defaut: activeUsers * 4)
  --security-attempts=<number> Nombre de tests securite / brute force (defaut: 250)
  --stress-requests=<number>   Nombre de requetes stress (defaut: activeUsers * 30)
  --read-concurrency=<number>  Concurrence lecture (defaut: min(activeUsers, 60))
  --write-concurrency=<number> Concurrence ecriture (defaut: min(activeUsers, 24))
  --stress-concurrency=<number> Concurrence stress (defaut: min(activeUsers * 2, 180))
  --help                       Affiche cette aide

Hooks chaos optionnels (variables d environnement):
  EXTREME_CHAOS_STOP_SERVER_CMD
  EXTREME_CHAOS_START_SERVER_CMD
  EXTREME_CHAOS_BREAK_DB_CMD
  EXTREME_CHAOS_RESTORE_DB_CMD
`)
}

class CookieJar {
  constructor() {
    this.cookies = new Map()
  }

  set(name, value) {
    this.cookies.set(name, value)
  }

  get(name) {
    return this.cookies.get(name) || ''
  }

  header() {
    if (this.cookies.size === 0) return ''
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ')
  }

  applyResponse(response) {
    const setCookieLines =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : [response.headers.get('set-cookie')].filter(Boolean)
    for (const line of setCookieLines) {
      const firstChunk = String(line || '').split(';', 1)[0]
      const separatorIndex = firstChunk.indexOf('=')
      if (separatorIndex <= 0) continue
      const name = firstChunk.slice(0, separatorIndex).trim()
      const value = firstChunk.slice(separatorIndex + 1).trim()
      this.set(name, value)
    }
  }
}

class SessionClient {
  constructor(baseUrl, credential) {
    this.baseUrl = baseUrl
    this.credential = credential
    this.jar = new CookieJar()
  }

  get csrfToken() {
    return this.jar.get('kya_csrf_token')
  }

  async request(method, endpoint, options = {}) {
    const startedAt = performance.now()
    const headers = {
      accept: 'application/json',
      ...(options.headers || {}),
    }
    const cookieHeader = this.jar.header()
    if (cookieHeader) {
      headers.cookie = cookieHeader
    }
    if (options.csrf && this.csrfToken) {
      headers['x-csrf-token'] = this.csrfToken
    }
    let body
    if (options.json !== undefined) {
      headers['content-type'] = 'application/json'
      body = JSON.stringify(options.json)
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body,
      redirect: 'manual',
    })
    this.jar.applyResponse(response)
    const rawText = await response.text().catch(() => '')
    let parsedBody = null
    try {
      parsedBody = rawText ? JSON.parse(rawText) : null
    } catch {
      parsedBody = rawText || null
    }
    return {
      ok: response.ok,
      status: response.status,
      endpoint,
      method,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      body: parsedBody,
      text: rawText,
    }
  }

  async login(passwordOverride, extraHeaders = {}) {
    return this.request('POST', '/api/authContext/login', {
      headers: extraHeaders,
      json: {
        identifiant: this.credential.phone || this.credential.email,
        motDePasse: passwordOverride || this.credential.password,
      },
    })
  }
}

function createMetricBucket(name) {
  return {
    name,
    startedAt: nowIso(),
    completedAt: null,
    totalRequests: 0,
    successCount: 0,
    errorCount: 0,
    statusCounts: {},
    latencies: [],
    slowestRequests: [],
    samples: [],
  }
}

function pushSlowRequest(bucket, sample) {
  bucket.slowestRequests.push(sample)
  bucket.slowestRequests.sort((left, right) => right.durationMs - left.durationMs)
  if (bucket.slowestRequests.length > 20) {
    bucket.slowestRequests.length = 20
  }
}

function pushSample(bucket, sample) {
  if (bucket.samples.length < 20) {
    bucket.samples.push(sample)
  }
}

function recordResult(bucket, result, expectedStatuses = [200]) {
  bucket.totalRequests += 1
  bucket.latencies.push(result.durationMs)
  bucket.statusCounts[result.status] = (bucket.statusCounts[result.status] || 0) + 1
  const success = expectedStatuses.includes(result.status)
  if (success) bucket.successCount += 1
  else bucket.errorCount += 1

  const sample = {
    endpoint: result.endpoint,
    method: result.method,
    status: result.status,
    durationMs: result.durationMs,
    success,
    bodySnippet:
      typeof result.body === 'string'
        ? result.body.slice(0, 180)
        : JSON.stringify(result.body || {}).slice(0, 180),
  }
  pushSample(bucket, sample)
  pushSlowRequest(bucket, sample)
}

function finalizeBucket(bucket) {
  bucket.completedAt = nowIso()
  bucket.latency = summarizeLatencies(bucket.latencies)
  delete bucket.latencies
  return bucket
}

async function runConcurrent(totalRequests, concurrency, handler, bucket) {
  let cursor = 0
  async function worker(workerIndex) {
    while (cursor < totalRequests) {
      const current = cursor
      cursor += 1
      try {
        await handler(current, workerIndex)
      } catch (error) {
        recordResult(
          bucket,
          {
            endpoint: 'internal-error',
            method: 'INTERNAL',
            status: 0,
            durationMs: 0,
            body: {
              message: error instanceof Error ? error.message : 'Unknown worker error',
              requestIndex: current,
              workerIndex,
            },
          },
          [200]
        )
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.max(1, concurrency) }, (_, index) => worker(index + 1))
  )
  return finalizeBucket(bucket)
}

async function bootstrapSessions(baseUrl, credentials, activeUsers) {
  const sessions = []
  const failures = []
  const bucket = createMetricBucket('bootstrap_login')
  await runConcurrent(
    activeUsers,
    Math.min(activeUsers, 25),
    async (index) => {
      const credential = credentials[index % credentials.length]
      const session = new SessionClient(baseUrl, credential)
      const loginResult = await session.login(null, {
        'x-forwarded-for': `172.16.${(index % 200) + 10}.${(index % 100) + 20}`,
      })
      recordResult(bucket, loginResult, [200])
      if (loginResult.status === 200 && session.csrfToken) {
        sessions.push(session)
      } else {
        failures.push({
          credential: credential.phone || credential.email,
          status: loginResult.status,
          body: loginResult.body,
        })
      }
    },
    bucket
  )
  return { sessions, failures }
}

async function runHealthProbe(baseUrl) {
  const startedAt = performance.now()
  try {
    const response = await fetch(`${baseUrl}/api/sante?verbeux=true`)
    const body = await response.json().catch(() => ({}))
    return {
      ok: response.ok,
      status: response.status,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      body,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      body: { error: error instanceof Error ? error.message : 'Unknown error' },
    }
  }
}

async function waitForHealth(baseUrl, predicate, timeoutMs = 60_000, intervalMs = 1500) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const probe = await runHealthProbe(baseUrl)
    if (predicate(probe)) {
      return {
        ok: true,
        probe,
        waitedMs: Date.now() - startedAt,
      }
    }
    await sleep(intervalMs)
  }
  return {
    ok: false,
    probe: await runHealthProbe(baseUrl),
    waitedMs: Date.now() - startedAt,
  }
}

async function runChaosTransition(name, breakCommand, restoreCommand, breakPredicate, restorePredicate, baseUrl) {
  if (!breakCommand || !restoreCommand) {
    return {
      name,
      skipped: true,
      reason: 'Chaos hook non configure',
    }
  }

  const startedAt = Date.now()
  await exec(breakCommand, { cwd: process.cwd(), shell: true })
  const outage = await waitForHealth(baseUrl, breakPredicate)
  await exec(restoreCommand, { cwd: process.cwd(), shell: true })
  const recovery = await waitForHealth(baseUrl, restorePredicate)

  return {
    name,
    skipped: false,
    outageDetected: outage.ok,
    recoveryDetected: recovery.ok,
    outageProbe: outage.probe,
    recoveryProbe: recovery.probe,
    durationMs: Date.now() - startedAt,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const reportsDir = getReportsDir(import.meta.url)
  const tag = String(args.tag || process.env.EXTREME_TAG || '').trim()
  const manifestPath =
    tag.length > 0
      ? buildReportPaths(import.meta.url, 'extreme-seed-manifest', tag).filePath
      : latestFile(reportsDir, 'extreme-seed-manifest-')
  const manifest = readJsonFile(manifestPath)
  if (!manifest) {
    throw new Error('Manifest de seed extreme introuvable. Lance d abord scripts/extreme-seed.mjs.')
  }

  const baseUrl = String(args['base-url'] || process.env.BASE_URL || 'http://localhost:3100').trim().replace(/\/+$/, '')
  const activeUsers = toInt(args['active-users'] ?? process.env.EXTREME_ACTIVE_USERS, 120, 1, 10000)
  const cappedActiveUsers = Math.min(activeUsers, 10000)
  const readRequests = toInt(
    args['read-requests'] ?? process.env.EXTREME_READ_REQUESTS,
    cappedActiveUsers * 20,
    1,
    500000
  )
  const writeRequests = toInt(
    args['write-requests'] ?? process.env.EXTREME_WRITE_REQUESTS,
    cappedActiveUsers * 4,
    0,
    100000
  )
  const securityAttempts = toInt(
    args['security-attempts'] ?? process.env.EXTREME_SECURITY_ATTEMPTS,
    250,
    10,
    500000
  )
  const stressRequests = toInt(
    args['stress-requests'] ?? process.env.EXTREME_STRESS_REQUESTS,
    cappedActiveUsers * 30,
    1,
    500000
  )
  const readConcurrency = toInt(
    args['read-concurrency'] ?? process.env.EXTREME_READ_CONCURRENCY,
    Math.min(cappedActiveUsers, 60),
    1,
    10000
  )
  const writeConcurrency = toInt(
    args['write-concurrency'] ?? process.env.EXTREME_WRITE_CONCURRENCY,
    Math.min(cappedActiveUsers, 24),
    1,
    10000
  )
  const stressConcurrency = toInt(
    args['stress-concurrency'] ?? process.env.EXTREME_STRESS_CONCURRENCY,
    Math.min(cappedActiveUsers * 2, 180),
    1,
    10000
  )

  const report = {
    version: 1,
    scenarioType: 'extreme-load-security',
    tag: manifest.tag,
    startedAt: nowIso(),
    baseUrl,
    config: {
      activeUsers,
      readRequests,
      writeRequests,
      securityAttempts,
      stressRequests,
      readConcurrency,
      writeConcurrency,
      stressConcurrency,
    },
    host: {
      before: hostSnapshot('before-load-suite'),
      after: null,
    },
    bootstrap: null,
    healthChecks: {},
    scenarios: {},
    chaos: [],
    totals: {},
  }

  console.info(
    `[EXTREME][LOAD] Demarrage suite securite/charge tag=${manifest.tag} baseUrl=${baseUrl}`
  )

  const initialHealth = await runHealthProbe(baseUrl)
  report.healthChecks.before = initialHealth
  if (!initialHealth.ok) {
    throw new Error(
      `Backend indisponible sur ${baseUrl}. Reponse: ${JSON.stringify(initialHealth.body)}`
    )
  }

  const credentials = manifest.admins
  if (!Array.isArray(credentials) || credentials.length === 0) {
    throw new Error('Aucun admin dans le manifest de seed.')
  }

  const bootstrap = await bootstrapSessions(baseUrl, credentials, cappedActiveUsers)
  report.bootstrap = {
    requestedSessions: cappedActiveUsers,
    createdSessions: bootstrap.sessions.length,
    failures: bootstrap.failures.slice(0, 20),
  }
  if (bootstrap.sessions.length === 0) {
    throw new Error('Impossible de creer des sessions admin pour la suite de charge.')
  }

  const unauthenticated = new SessionClient(baseUrl, credentials[0])
  const superAdminSession = manifest.superAdmin
    ? new SessionClient(baseUrl, manifest.superAdmin)
    : null
  if (superAdminSession) {
    await superAdminSession.login()
  }

  const readEndpoints = [
    '/api/authContext',
    '/api/clients',
    '/api/documents',
    '/api/payments',
    '/api/deposits',
    '/api/notifications',
    '/api/admin_payments',
    '/api/admin_payments/status',
  ]

  report.scenarios.read_mix = await runConcurrent(
    readRequests,
    readConcurrency,
    async (requestIndex) => {
      const session = bootstrap.sessions[requestIndex % bootstrap.sessions.length]
      const endpoint = pickFrom(readEndpoints, requestIndex)
      const result = await session.request('GET', endpoint)
      recordResult(report.scenarios.read_mixBucket, result, [200])
    },
    (report.scenarios.read_mixBucket = createMetricBucket('read_mix'))
  )

  report.scenarios.document_write_mix = await runConcurrent(
    writeRequests,
    writeConcurrency,
    async (requestIndex) => {
      const session = bootstrap.sessions[requestIndex % bootstrap.sessions.length]
      const credential = credentials[requestIndex % credentials.length]
      const result = await session.request('POST', '/api/documents', {
        csrf: true,
        json: {
          name: `extreme-upload-${manifest.tag}-${requestIndex + 1}.pdf`,
          type: 'load_test_document',
          url: `https://res.cloudinary.com/kya-extreme/upload/v1/${manifest.tag}/runtime-${requestIndex + 1}.pdf`,
          locationId: credential.sampleLocationId || undefined,
        },
      })
      recordResult(report.scenarios.document_write_mixBucket, result, [200])
    },
    (report.scenarios.document_write_mixBucket = createMetricBucket('document_write_mix'))
  )

  report.scenarios.protected_route_without_auth = await runConcurrent(
    Math.min(50, securityAttempts),
    Math.min(10, securityAttempts),
    async () => {
      const result = await unauthenticated.request('GET', '/api/clients')
      recordResult(report.scenarios.protected_route_without_authBucket, result, [401, 403])
    },
    (report.scenarios.protected_route_without_authBucket = createMetricBucket(
      'protected_route_without_auth'
    ))
  )

  report.scenarios.bad_csrf_write = await runConcurrent(
    Math.min(50, securityAttempts),
    Math.min(12, securityAttempts),
    async (requestIndex) => {
      const session = bootstrap.sessions[requestIndex % bootstrap.sessions.length]
      const result = await session.request('POST', '/api/clients', {
        json: {
          firstName: 'Bad',
          lastName: 'Csrf',
          phone: `77555${String(requestIndex).padStart(4, '0')}`,
          cni: `BAD-CSRF-${manifest.tag}-${requestIndex}`,
        },
      })
      recordResult(report.scenarios.bad_csrf_writeBucket, result, [401, 403])
    },
    (report.scenarios.bad_csrf_writeBucket = createMetricBucket('bad_csrf_write'))
  )

  report.scenarios.tampered_payment = await runConcurrent(
    Math.min(40, securityAttempts),
    Math.min(8, securityAttempts),
    async (requestIndex) => {
      const session = bootstrap.sessions[requestIndex % bootstrap.sessions.length]
      const credential = credentials[requestIndex % credentials.length]
      const result = await session.request('POST', '/api/admin_payments', {
        csrf: true,
        json: {
          id: `${manifest.tag}-tampered-payment-${requestIndex + 1}`,
          adminId: credential.adminId,
          entrepriseId: credential.entrepriseId,
          amount: -5000,
          method: 'wave',
          month: '2026-01',
        },
      })
      recordResult(report.scenarios.tampered_paymentBucket, result, [400, 401, 403])
    },
    (report.scenarios.tampered_paymentBucket = createMetricBucket('tampered_payment'))
  )

  report.scenarios.brute_force_login = await runConcurrent(
    securityAttempts,
    Math.min(30, securityAttempts),
    async (requestIndex) => {
      const credential = credentials[requestIndex % credentials.length]
      const attackSession = new SessionClient(baseUrl, credential)
      const result = await attackSession.login('WrongPassword!@#', {
        'x-forwarded-for': `203.0.113.${(requestIndex % 50) + 1}`,
      })
      recordResult(report.scenarios.brute_force_loginBucket, result, [401, 429])
    },
    (report.scenarios.brute_force_loginBucket = createMetricBucket('brute_force_login'))
  )

  const logoutReuseBucket = createMetricBucket('logout_token_reuse')
  {
    const session = new SessionClient(baseUrl, credentials[0])
    const loginResult = await session.login()
    recordResult(logoutReuseBucket, loginResult, [200])

    const contextResult = await session.request('GET', '/api/authContext')
    recordResult(logoutReuseBucket, contextResult, [200])

    const logoutResult = await session.request('POST', '/api/authContext/logout', {
      csrf: true,
      json: {},
    })
    recordResult(logoutReuseBucket, logoutResult, [200])

    const reuseResult = await session.request('GET', '/api/authContext')
    recordResult(logoutReuseBucket, reuseResult, [401, 403])
  }
  report.scenarios.logout_token_reuse = finalizeBucket(logoutReuseBucket)

  if (superAdminSession) {
    const superAdminBypassBucket = createMetricBucket('super_admin_without_second_auth')
    const result = await superAdminSession.request('GET', '/api/payment-providers/config')
    recordResult(superAdminBypassBucket, result, [401, 403])
    report.scenarios.super_admin_without_second_auth = finalizeBucket(superAdminBypassBucket)
  }

  const stressMixEndpoints = [
    { method: 'GET', endpoint: '/api/authContext' },
    { method: 'GET', endpoint: '/api/clients' },
    { method: 'GET', endpoint: '/api/documents' },
    { method: 'GET', endpoint: '/api/admin_payments/status' },
    { method: 'GET', endpoint: '/api/notifications' },
  ]
  report.scenarios.stress_mix = await runConcurrent(
    stressRequests,
    stressConcurrency,
    async (requestIndex) => {
      const session = bootstrap.sessions[requestIndex % bootstrap.sessions.length]
      const endpoint = pickFrom(stressMixEndpoints, requestIndex)
      const result = await session.request(endpoint.method, endpoint.endpoint)
      recordResult(report.scenarios.stress_mixBucket, result, [200])
    },
    (report.scenarios.stress_mixBucket = createMetricBucket('stress_mix'))
  )

  const stopServerCmd = String(process.env.EXTREME_CHAOS_STOP_SERVER_CMD || '').trim()
  const startServerCmd = String(process.env.EXTREME_CHAOS_START_SERVER_CMD || '').trim()
  const breakDbCmd = String(process.env.EXTREME_CHAOS_BREAK_DB_CMD || '').trim()
  const restoreDbCmd = String(process.env.EXTREME_CHAOS_RESTORE_DB_CMD || '').trim()

  report.chaos.push(
    await runChaosTransition(
      'server_stop_restart',
      stopServerCmd,
      startServerCmd,
      (probe) => !probe.ok || probe.status >= 500,
      (probe) => probe.ok && String(probe.body?.statut || '').toLowerCase() === 'ok',
      baseUrl
    )
  )
  report.chaos.push(
    await runChaosTransition(
      'database_break_restore',
      breakDbCmd,
      restoreDbCmd,
      (probe) =>
        String(probe.body?.baseDeDonnees || '').toLowerCase() === 'indisponible' ||
        String(probe.body?.baseDeDonnees || '').toLowerCase() === 'down' ||
        !probe.ok,
      (probe) => probe.ok && String(probe.body?.baseDeDonnees || '').toLowerCase() === 'ok',
      baseUrl
    )
  )

  report.healthChecks.after = await runHealthProbe(baseUrl)
  report.host.after = hostSnapshot('after-load-suite')
  report.completedAt = nowIso()
  report.durationMs =
    new Date(report.completedAt).getTime() - new Date(report.startedAt).getTime()

  const allScenarioObjects = Object.values(report.scenarios).filter(
    (scenario) => scenario && typeof scenario === 'object' && scenario.totalRequests !== undefined
  )
  report.totals = {
    scenarioCount: allScenarioObjects.length,
    totalRequests: allScenarioObjects.reduce(
      (sum, scenario) => sum + Number(scenario.totalRequests || 0),
      0
    ),
    totalSuccess: allScenarioObjects.reduce(
      (sum, scenario) => sum + Number(scenario.successCount || 0),
      0
    ),
    totalErrors: allScenarioObjects.reduce(
      (sum, scenario) => sum + Number(scenario.errorCount || 0),
      0
    ),
  }

  delete report.scenarios.read_mixBucket
  delete report.scenarios.document_write_mixBucket
  delete report.scenarios.protected_route_without_authBucket
  delete report.scenarios.bad_csrf_writeBucket
  delete report.scenarios.tampered_paymentBucket
  delete report.scenarios.brute_force_loginBucket
  delete report.scenarios.stress_mixBucket

  const outputTag = `${manifest.tag}-${timestampToken()}`
  const timestampedPath = buildReportPaths(import.meta.url, 'extreme-load-report', outputTag).filePath
  const latestPath = buildReportPaths(import.meta.url, 'extreme-load-report-latest', manifest.tag).filePath
  writeJsonFile(timestampedPath, report)
  writeJsonFile(latestPath, report)

  console.info(
    `[EXTREME][LOAD] Termine en ${humanDuration(report.durationMs)}. Rapport: ${timestampedPath}`
  )
  console.info(
    `[EXTREME][LOAD] Total requetes=${report.totals.totalRequests} succes=${report.totals.totalSuccess} erreurs=${report.totals.totalErrors}`
  )
}

main().catch((error) => {
  console.error('[EXTREME][LOAD] Echec:', error)
  process.exitCode = 1
})
