import { createHmac, timingSafeEqual } from 'node:crypto'
import type { PrismaClient } from '@prisma/client'
import type { InterfaceServiceChiffrement } from '@/src/coeur/interfaces/InterfaceServiceChiffrement'

export type TypeModePaiementProvider = 'manual' | 'api'
export type TypePaiementProvider = 'wave' | 'orange_money'
export type TypePaiementProviderActif = 'wave' | 'orange'

const SCOPE_CLE_GLOBAL = 'GLOBAL'
const CLE_PROVIDER_WAVE = 'payment_provider_wave_config_v1'
const CLE_PROVIDER_ORANGE = 'payment_provider_orange_money_config_v1'
const CHEMIN_INITIATION_PAR_DEFAUT = '/payments'

type TypeWaveConfigStockee = {
  apiBaseUrl: string
  initiationPath: string
  merchantId: string
  apiKey: string
  apiSecret: string
  webhookSecret: string
}

type TypeOrangeMoneyConfigStockee = {
  apiBaseUrl: string
  initiationPath: string
  merchantCode: string
  clientId: string
  clientSecret: string
  webhookSecret: string
}

export type TypeConfigProvidersPaiementStockee = {
  wave: TypeWaveConfigStockee
  orangeMoney: TypeOrangeMoneyConfigStockee
}

export type TypeConfigProvidersPaiementMasquee = {
  wave: TypeWaveConfigStockee & {
    apiKeyConfigured: boolean
    apiKeyMasked: string
    apiSecretConfigured: boolean
    apiSecretMasked: string
    webhookSecretConfigured: boolean
    webhookSecretMasked: string
  }
  orangeMoney: TypeOrangeMoneyConfigStockee & {
    clientSecretConfigured: boolean
    clientSecretMasked: string
    webhookSecretConfigured: boolean
    webhookSecretMasked: string
  }
}

export type TypeDisponibilitePaiementProvider = {
  waveApiConfigured: boolean
  orangeMoneyApiConfigured: boolean
}

export type TypeResultatInitiationPaiementProvider = {
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  checkoutUrl: string
  providerReference: string
  transactionRef: string
  paidAt: string | null
  note: string
}

export type TypePayloadWebhookPaiementProvider = {
  paymentId: string
  providerReference: string
  transactionRef: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  paidAt: string | null
  note: string
}

const CONFIG_WAVE_PAR_DEFAUT: TypeWaveConfigStockee = {
  apiBaseUrl: '',
  initiationPath: CHEMIN_INITIATION_PAR_DEFAUT,
  merchantId: '',
  apiKey: '',
  apiSecret: '',
  webhookSecret: '',
}

const CONFIG_ORANGE_PAR_DEFAUT: TypeOrangeMoneyConfigStockee = {
  apiBaseUrl: '',
  initiationPath: CHEMIN_INITIATION_PAR_DEFAUT,
  merchantCode: '',
  clientId: '',
  clientSecret: '',
  webhookSecret: '',
}

function normaliserTexte(valeur: unknown): string {
  return String(valeur || '').trim()
}

function normaliserUrlBase(valeur: unknown): string {
  return normaliserTexte(valeur).replace(/\/+$/, '')
}

function normaliserCheminInitiation(valeur: unknown): string {
  const brut = normaliserTexte(valeur)
  if (!brut) return CHEMIN_INITIATION_PAR_DEFAUT
  return brut.startsWith('/') ? brut : `/${brut}`
}

function normaliserConfigWave(brut: unknown): TypeWaveConfigStockee {
  const source = brut && typeof brut === 'object' && !Array.isArray(brut) ? (brut as Record<string, unknown>) : {}
  return {
    apiBaseUrl: normaliserUrlBase(source.apiBaseUrl),
    initiationPath: normaliserCheminInitiation(source.initiationPath),
    merchantId: normaliserTexte(source.merchantId),
    apiKey: normaliserTexte(source.apiKey),
    apiSecret: normaliserTexte(source.apiSecret),
    webhookSecret: normaliserTexte(source.webhookSecret),
  }
}

function normaliserConfigOrangeMoney(brut: unknown): TypeOrangeMoneyConfigStockee {
  const source = brut && typeof brut === 'object' && !Array.isArray(brut) ? (brut as Record<string, unknown>) : {}
  return {
    apiBaseUrl: normaliserUrlBase(source.apiBaseUrl),
    initiationPath: normaliserCheminInitiation(source.initiationPath),
    merchantCode: normaliserTexte(source.merchantCode),
    clientId: normaliserTexte(source.clientId),
    clientSecret: normaliserTexte(source.clientSecret),
    webhookSecret: normaliserTexte(source.webhookSecret),
  }
}

function masquerSecret(secret: string): string {
  const brut = normaliserTexte(secret)
  if (!brut) return ''
  if (brut.length <= 4) return '****'
  return `${'*'.repeat(Math.max(4, brut.length - 4))}${brut.slice(-4)}`
}

async function lireConfigurationChiffree<T>(
  prisma: PrismaClient,
  serviceChiffrement: InterfaceServiceChiffrement,
  cle: string,
  normaliser: (valeur: unknown) => T,
  fallback: T
): Promise<T> {
  const element = await prisma.configurationSysteme.findUnique({
    where: {
      cle_scopeCle: {
        cle,
        scopeCle: SCOPE_CLE_GLOBAL,
      },
    },
    select: { valeurTexte: true },
  })

  const texte = normaliserTexte(element?.valeurTexte)
  if (!texte) return fallback

  try {
    const dechiffre = serviceChiffrement.dechiffrer(texte)
    return normaliser(JSON.parse(dechiffre))
  } catch {
    return fallback
  }
}

async function sauvegarderConfigurationChiffree(
  prisma: PrismaClient,
  serviceChiffrement: InterfaceServiceChiffrement,
  cle: string,
  valeur: unknown
): Promise<void> {
  const chargeUtile = JSON.stringify(valeur || {})
  const valeurTexte = serviceChiffrement.chiffrer(chargeUtile)

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
      typeValeur: 'STRING',
      valeurTexte,
      origine: 'CUSTOM',
      verrouille: false,
    },
    update: {
      valeurTexte,
      typeValeur: 'STRING',
      origine: 'CUSTOM',
      verrouille: false,
    },
  })
}

export async function lireConfigurationProvidersPaiement(
  prisma: PrismaClient,
  serviceChiffrement: InterfaceServiceChiffrement
): Promise<TypeConfigProvidersPaiementStockee> {
  const [wave, orangeMoney] = await Promise.all([
    lireConfigurationChiffree(
      prisma,
      serviceChiffrement,
      CLE_PROVIDER_WAVE,
      normaliserConfigWave,
      CONFIG_WAVE_PAR_DEFAUT
    ),
    lireConfigurationChiffree(
      prisma,
      serviceChiffrement,
      CLE_PROVIDER_ORANGE,
      normaliserConfigOrangeMoney,
      CONFIG_ORANGE_PAR_DEFAUT
    ),
  ])

  return { wave, orangeMoney }
}

function fusionnerConfigWave(
  existante: TypeWaveConfigStockee,
  brute: unknown
): TypeWaveConfigStockee {
  const source = brute && typeof brute === 'object' && !Array.isArray(brute) ? (brute as Record<string, unknown>) : {}
  return normaliserConfigWave({
    ...existante,
    apiBaseUrl:
      Object.prototype.hasOwnProperty.call(source, 'apiBaseUrl') ? source.apiBaseUrl : existante.apiBaseUrl,
    initiationPath:
      Object.prototype.hasOwnProperty.call(source, 'initiationPath')
        ? source.initiationPath
        : existante.initiationPath,
    merchantId:
      Object.prototype.hasOwnProperty.call(source, 'merchantId') ? source.merchantId : existante.merchantId,
    apiKey:
      Object.prototype.hasOwnProperty.call(source, 'apiKey') && normaliserTexte(source.apiKey)
        ? source.apiKey
        : existante.apiKey,
    apiSecret:
      Object.prototype.hasOwnProperty.call(source, 'apiSecret') && normaliserTexte(source.apiSecret)
        ? source.apiSecret
        : existante.apiSecret,
    webhookSecret:
      Object.prototype.hasOwnProperty.call(source, 'webhookSecret') && normaliserTexte(source.webhookSecret)
        ? source.webhookSecret
        : existante.webhookSecret,
  })
}

function fusionnerConfigOrangeMoney(
  existante: TypeOrangeMoneyConfigStockee,
  brute: unknown
): TypeOrangeMoneyConfigStockee {
  const source = brute && typeof brute === 'object' && !Array.isArray(brute) ? (brute as Record<string, unknown>) : {}
  return normaliserConfigOrangeMoney({
    ...existante,
    apiBaseUrl:
      Object.prototype.hasOwnProperty.call(source, 'apiBaseUrl') ? source.apiBaseUrl : existante.apiBaseUrl,
    initiationPath:
      Object.prototype.hasOwnProperty.call(source, 'initiationPath')
        ? source.initiationPath
        : existante.initiationPath,
    merchantCode:
      Object.prototype.hasOwnProperty.call(source, 'merchantCode')
        ? source.merchantCode
        : existante.merchantCode,
    clientId:
      Object.prototype.hasOwnProperty.call(source, 'clientId') ? source.clientId : existante.clientId,
    clientSecret:
      Object.prototype.hasOwnProperty.call(source, 'clientSecret') && normaliserTexte(source.clientSecret)
        ? source.clientSecret
        : existante.clientSecret,
    webhookSecret:
      Object.prototype.hasOwnProperty.call(source, 'webhookSecret') && normaliserTexte(source.webhookSecret)
        ? source.webhookSecret
        : existante.webhookSecret,
  })
}

export async function sauvegarderConfigurationProvidersPaiement(
  prisma: PrismaClient,
  serviceChiffrement: InterfaceServiceChiffrement,
  brute: unknown
): Promise<TypeConfigProvidersPaiementMasquee> {
  const source = brute && typeof brute === 'object' && !Array.isArray(brute) ? (brute as Record<string, unknown>) : {}
  const existante = await lireConfigurationProvidersPaiement(prisma, serviceChiffrement)
  const wave = fusionnerConfigWave(existante.wave, source.wave)
  const orangeMoney = fusionnerConfigOrangeMoney(existante.orangeMoney, source.orangeMoney)

  await Promise.all([
    sauvegarderConfigurationChiffree(prisma, serviceChiffrement, CLE_PROVIDER_WAVE, wave),
    sauvegarderConfigurationChiffree(prisma, serviceChiffrement, CLE_PROVIDER_ORANGE, orangeMoney),
  ])

  return masquerConfigurationProvidersPaiement({ wave, orangeMoney })
}

export function masquerConfigurationProvidersPaiement(
  config: TypeConfigProvidersPaiementStockee
): TypeConfigProvidersPaiementMasquee {
  return {
    wave: {
      ...config.wave,
      apiKeyConfigured: Boolean(config.wave.apiKey),
      apiKeyMasked: masquerSecret(config.wave.apiKey),
      apiSecretConfigured: Boolean(config.wave.apiSecret),
      apiSecretMasked: masquerSecret(config.wave.apiSecret),
      webhookSecretConfigured: Boolean(config.wave.webhookSecret),
      webhookSecretMasked: masquerSecret(config.wave.webhookSecret),
      apiKey: '',
      apiSecret: '',
      webhookSecret: '',
    },
    orangeMoney: {
      ...config.orangeMoney,
      clientSecretConfigured: Boolean(config.orangeMoney.clientSecret),
      clientSecretMasked: masquerSecret(config.orangeMoney.clientSecret),
      webhookSecretConfigured: Boolean(config.orangeMoney.webhookSecret),
      webhookSecretMasked: masquerSecret(config.orangeMoney.webhookSecret),
      clientSecret: '',
      webhookSecret: '',
    },
  }
}

export function calculerDisponibiliteProvidersPaiement(
  config: TypeConfigProvidersPaiementStockee
): TypeDisponibilitePaiementProvider {
  return {
    waveApiConfigured: Boolean(config.wave.apiBaseUrl && config.wave.apiKey && config.wave.apiSecret),
    orangeMoneyApiConfigured: Boolean(
      config.orangeMoney.apiBaseUrl && config.orangeMoney.clientId && config.orangeMoney.clientSecret
    ),
  }
}

function construireUrlInitiation(baseUrl: string, path: string): string {
  const base = normaliserUrlBase(baseUrl)
  const chemin = normaliserCheminInitiation(path)
  return `${base}${chemin}`
}

function normaliserStatutPaiementProvider(
  valeur: unknown
): 'pending' | 'paid' | 'failed' | 'cancelled' {
  const statut = normaliserTexte(valeur).toLowerCase()
  if (statut === 'paid' || statut === 'failed' || statut === 'cancelled') return statut
  return 'pending'
}

export async function initierPaiementProvider(options: {
  provider: TypePaiementProvider
  amount: number
  adminId: string
  entrepriseId: string
  month: string
  payerPhone: string
  recipientPhone: string
  recipientName: string
  callbackUrl: string
  note: string
  config: TypeConfigProvidersPaiementStockee
}): Promise<TypeResultatInitiationPaiementProvider> {
  const providerActif: TypePaiementProviderActif =
    options.provider === 'wave' ? 'wave' : 'orange'
  const configProvider =
    options.provider === 'wave' ? options.config.wave : options.config.orangeMoney
  const endpoint = construireUrlInitiation(configProvider.apiBaseUrl, configProvider.initiationPath)
  if (!endpoint) {
    throw new Error(`Endpoint API ${options.provider === 'wave' ? 'Wave' : 'Orange Money'} non configuré.`)
  }

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-kya-provider': providerActif,
  }

  if (options.provider === 'wave') {
    const configWave = options.config.wave
    headers.authorization = `Bearer ${configWave.apiKey}`
    headers['x-api-secret'] = configWave.apiSecret
    if (configWave.merchantId) {
      headers['x-merchant-id'] = configWave.merchantId
    }
  } else {
    const configOrange = options.config.orangeMoney
    headers['x-client-id'] = configOrange.clientId
    headers['x-client-secret'] = configOrange.clientSecret
    if (configOrange.merchantCode) {
      headers['x-merchant-code'] = configOrange.merchantCode
    }
  }

  const corps = {
    amount: options.amount,
    currency: 'XOF',
    method: options.provider,
    adminId: options.adminId,
    entrepriseId: options.entrepriseId,
    month: options.month,
    payerPhone: options.payerPhone,
    recipientPhone: options.recipientPhone,
    recipientName: options.recipientName,
    callbackUrl: options.callbackUrl,
    note: options.note,
    metadata: {
      source: 'keur-ya-aicha',
      adminId: options.adminId,
      entrepriseId: options.entrepriseId,
      month: options.month,
    },
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(corps),
  })

  const texte = await response.text().catch(() => '')
  let payload: Record<string, unknown> = {}
  try {
    payload = texte ? (JSON.parse(texte) as Record<string, unknown>) : {}
  } catch {
    payload = {}
  }

  if (!response.ok) {
    const message =
      normaliserTexte(payload.error) ||
      normaliserTexte(payload.message) ||
      `Le provider ${options.provider} a refusé l'initiation (${response.status}).`
    throw new Error(message)
  }

  return {
    status: normaliserStatutPaiementProvider(payload.status),
    checkoutUrl: normaliserTexte(payload.checkoutUrl || payload.paymentUrl || payload.url),
    providerReference: normaliserTexte(payload.providerReference || payload.referenceFournisseur || payload.reference),
    transactionRef: normaliserTexte(payload.transactionRef || payload.referenceTransaction),
    paidAt: normaliserTexte(payload.paidAt || payload.payeLe) || null,
    note: normaliserTexte(payload.note || payload.message),
  }
}

function signaturesCandidates(signatureAttendue: string): string[] {
  const normale = normaliserTexte(signatureAttendue)
  if (!normale) return []
  return [normale, Buffer.from(normale, 'hex').toString('base64url')]
}

function signatureCorrespond(valeurRecue: string, valeurAttendue: string): boolean {
  const recue = Buffer.from(valeurRecue)
  const attendue = Buffer.from(valeurAttendue)
  if (recue.length !== attendue.length) return false
  return timingSafeEqual(recue, attendue)
}

export function verifierSignatureWebhookProvider(options: {
  provider: TypePaiementProvider
  rawBody: string
  headers: Headers
  config: TypeConfigProvidersPaiementStockee
}): boolean {
  const configProvider =
    options.provider === 'wave' ? options.config.wave : options.config.orangeMoney
  const secret = normaliserTexte(configProvider.webhookSecret)
  if (!secret) return false

  const directSecret = normaliserTexte(
    options.headers.get('x-kya-webhook-secret') ||
      options.headers.get('x-provider-webhook-secret')
  )
  if (directSecret && signatureCorrespond(directSecret, secret)) {
    return true
  }

  const signatureRecue = normaliserTexte(
    options.headers.get('x-kya-provider-signature') ||
      options.headers.get('x-provider-signature') ||
      options.headers.get('x-signature')
  )
  if (!signatureRecue) return false

  const signatureHex = createHmac('sha256', secret).update(options.rawBody).digest('hex')
  return signaturesCandidates(signatureHex).some((candidate) =>
    signatureCorrespond(signatureRecue, candidate)
  )
}

export function extrairePayloadWebhookProvider(brut: unknown): TypePayloadWebhookPaiementProvider {
  const source = brut && typeof brut === 'object' && !Array.isArray(brut) ? (brut as Record<string, unknown>) : {}
  return {
    paymentId: normaliserTexte(source.paymentId || source.idPaiement),
    providerReference: normaliserTexte(source.providerReference || source.referenceFournisseur || source.reference),
    transactionRef: normaliserTexte(source.transactionRef || source.referenceTransaction),
    status: normaliserStatutPaiementProvider(source.status || source.statut),
    paidAt: normaliserTexte(source.paidAt || source.payeLe) || null,
    note: normaliserTexte(source.note || source.message),
  }
}

export function construireUrlWebhookPaiementProvider(
  origin: string,
  provider: TypePaiementProvider
): string {
  const base = normaliserUrlBase(origin)
  return `${base}/api/admin_payments/webhook/${provider}`
}
