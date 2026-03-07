import type { PrismaClient } from '@prisma/client'

const CLE_PARAMETRE_POLITIQUE_GLOBALE = 'platform_config_v1'
const DUREE_CACHE_POLITIQUE_MS = 15_000
const DUREE_COOLDOWN_RETENTION_MS = 60_000

export type TypePolitiquePlateforme = {
  maintenance: {
    enabled: boolean
    message: string
  }
  sessionSecurity: {
    sessionDurationMinutes: number
    inactivityTimeoutMinutes: number
    maxFailedLogins: number
    lockoutMinutes: number
  }
  paymentRules: {
    graceDays: number
    latePenaltyPercent: number
    blockOnOverdue: boolean
    recipientName: string
    waveRecipientPhone: string
    orangeRecipientPhone: string
    orangeOtpEnabled: boolean
  }
  documents: {
    maxUploadMb: number
    allowedMimeTypes: string[]
    retentionDays: number
  }
  notifications: {
    channels: {
      sms: boolean
      email: boolean
      whatsapp: boolean
    }
    events: {
      maintenance: boolean
      loginFailure: boolean
      paymentOverdue: boolean
      apiError: boolean
    }
    templates: {
      maintenance: string
      loginFailure: string
      paymentOverdue: string
      apiError: string
    }
  }
  branding: {
    appName: string
    logoUrl: string
    primaryColor: string
    footerText: string
  }
  auditCompliance: {
    retentionDays: number
    autoExportEnabled: boolean
    autoExportFormat: 'csv' | 'json'
    autoExportIntervalHours: number
    alertWebhookEnabled: boolean
    alertWebhookUrl: string
    alertWebhookSecret: string
    alertOnApiError: boolean
    alertOnSecurityEvent: boolean
  }
}

export const POLITIQUE_PLATEFORME_PAR_DEFAUT: TypePolitiquePlateforme = {
  maintenance: {
    enabled: false,
    message: "Maintenance en cours. Les actions d'ecriture sont temporairement desactivees.",
  },
  sessionSecurity: {
    sessionDurationMinutes: 480,
    inactivityTimeoutMinutes: 120,
    maxFailedLogins: 5,
    lockoutMinutes: 30,
  },
  paymentRules: {
    graceDays: 5,
    latePenaltyPercent: 0,
    blockOnOverdue: true,
    recipientName: 'Keur Ya Aicha',
    waveRecipientPhone: '771719013',
    orangeRecipientPhone: '771719013',
    orangeOtpEnabled: true,
  },
  documents: {
    maxUploadMb: 10,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    retentionDays: 365,
  },
  notifications: {
    channels: {
      sms: false,
      email: true,
      whatsapp: false,
    },
    events: {
      maintenance: true,
      loginFailure: true,
      paymentOverdue: true,
      apiError: true,
    },
    templates: {
      maintenance: 'Maintenance active: {message}',
      loginFailure: 'Tentative de connexion echouee pour {username}',
      paymentOverdue: 'Abonnement en retard pour {adminId} ({month})',
      apiError: 'Erreur API {path}: {error}',
    },
  },
  branding: {
    appName: 'Keur Ya Aicha',
    logoUrl: '/logo.png',
    primaryColor: '#121B53',
    footerText: '© Keur Ya Aicha',
  },
  auditCompliance: {
    retentionDays: 365,
    autoExportEnabled: false,
    autoExportFormat: 'csv',
    autoExportIntervalHours: 24,
    alertWebhookEnabled: false,
    alertWebhookUrl: '',
    alertWebhookSecret: '',
    alertOnApiError: true,
    alertOnSecurityEvent: true,
  },
}

let cachePolitique: { expireLe: number; politique: TypePolitiquePlateforme } | null = null
let promesseLecturePolitique: Promise<TypePolitiquePlateforme> | null = null
let dernierSweepRetention = 0

type TypeObjetInconnu = Record<string, unknown>

function bornerNombre(valeur: unknown, min: number, max: number, fallback: number): number {
  const nombre = Number(valeur)
  if (!Number.isFinite(nombre)) return fallback
  return Math.min(Math.max(nombre, min), max)
}

function versBoolean(valeur: unknown, fallback: boolean): boolean {
  if (typeof valeur === 'boolean') return valeur
  if (valeur === 'true') return true
  if (valeur === 'false') return false
  return fallback
}

function versTexte(valeur: unknown, fallback: string): string {
  const texte = typeof valeur === 'string' ? valeur : valeur == null ? '' : String(valeur)
  return texte.trim() || fallback
}

function versTexteOptionnel(valeur: unknown): string {
  const texte = typeof valeur === 'string' ? valeur : valeur == null ? '' : String(valeur)
  return texte.trim()
}

function versTableauTexte(valeur: unknown, fallback: string[]): string[] {
  if (!Array.isArray(valeur)) return [...fallback]
  const normalise = valeur
    .map((element) => String(element || '').trim())
    .filter(Boolean)
  if (normalise.length === 0) return [...fallback]
  return [...new Set(normalise)]
}

function versObjet(valeur: unknown): TypeObjetInconnu {
  if (!valeur || typeof valeur !== 'object' || Array.isArray(valeur)) return {}
  return valeur as TypeObjetInconnu
}

function normaliserPolitique(brute: unknown): TypePolitiquePlateforme {
  const source = versObjet(brute)
  const maintenance = versObjet(source.maintenance)
  const sessionSecurity = versObjet(source.sessionSecurity)
  const paymentRules = versObjet(source.paymentRules)
  const documents = versObjet(source.documents)
  const notifications = versObjet(source.notifications)
  const channels = versObjet(notifications.channels)
  const events = versObjet(notifications.events)
  const templates = versObjet(notifications.templates)
  const branding = versObjet(source.branding)
  const audit = versObjet(source.auditCompliance)

  return {
    maintenance: {
      enabled: versBoolean(maintenance.enabled, POLITIQUE_PLATEFORME_PAR_DEFAUT.maintenance.enabled),
      message: versTexte(maintenance.message, POLITIQUE_PLATEFORME_PAR_DEFAUT.maintenance.message),
    },
    sessionSecurity: {
      sessionDurationMinutes: bornerNombre(
        sessionSecurity.sessionDurationMinutes,
        5,
        24 * 60,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.sessionSecurity.sessionDurationMinutes
      ),
      inactivityTimeoutMinutes: bornerNombre(
        sessionSecurity.inactivityTimeoutMinutes,
        1,
        24 * 60,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.sessionSecurity.inactivityTimeoutMinutes
      ),
      maxFailedLogins: bornerNombre(
        sessionSecurity.maxFailedLogins,
        1,
        50,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.sessionSecurity.maxFailedLogins
      ),
      lockoutMinutes: bornerNombre(
        sessionSecurity.lockoutMinutes,
        1,
        24 * 60,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.sessionSecurity.lockoutMinutes
      ),
    },
    paymentRules: {
      graceDays: bornerNombre(
        paymentRules.graceDays,
        0,
        31,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.paymentRules.graceDays
      ),
      latePenaltyPercent: bornerNombre(
        paymentRules.latePenaltyPercent,
        0,
        100,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.paymentRules.latePenaltyPercent
      ),
      blockOnOverdue: versBoolean(
        paymentRules.blockOnOverdue,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.paymentRules.blockOnOverdue
      ),
      recipientName: versTexte(
        paymentRules.recipientName,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.paymentRules.recipientName
      ),
      waveRecipientPhone: versTexteOptionnel(paymentRules.waveRecipientPhone),
      orangeRecipientPhone: versTexteOptionnel(paymentRules.orangeRecipientPhone),
      orangeOtpEnabled: versBoolean(
        paymentRules.orangeOtpEnabled,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.paymentRules.orangeOtpEnabled
      ),
    },
    documents: {
      maxUploadMb: bornerNombre(
        documents.maxUploadMb,
        1,
        1024,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.documents.maxUploadMb
      ),
      allowedMimeTypes: versTableauTexte(
        documents.allowedMimeTypes,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.documents.allowedMimeTypes
      ),
      retentionDays: bornerNombre(
        documents.retentionDays,
        1,
        3650,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.documents.retentionDays
      ),
    },
    notifications: {
      channels: {
        sms: versBoolean(channels.sms, POLITIQUE_PLATEFORME_PAR_DEFAUT.notifications.channels.sms),
        email: versBoolean(channels.email, POLITIQUE_PLATEFORME_PAR_DEFAUT.notifications.channels.email),
        whatsapp: versBoolean(channels.whatsapp, POLITIQUE_PLATEFORME_PAR_DEFAUT.notifications.channels.whatsapp),
      },
      events: {
        maintenance: versBoolean(events.maintenance, POLITIQUE_PLATEFORME_PAR_DEFAUT.notifications.events.maintenance),
        loginFailure: versBoolean(events.loginFailure, POLITIQUE_PLATEFORME_PAR_DEFAUT.notifications.events.loginFailure),
        paymentOverdue: versBoolean(events.paymentOverdue, POLITIQUE_PLATEFORME_PAR_DEFAUT.notifications.events.paymentOverdue),
        apiError: versBoolean(events.apiError, POLITIQUE_PLATEFORME_PAR_DEFAUT.notifications.events.apiError),
      },
      templates: {
        maintenance: versTexte(templates.maintenance, POLITIQUE_PLATEFORME_PAR_DEFAUT.notifications.templates.maintenance),
        loginFailure: versTexte(templates.loginFailure, POLITIQUE_PLATEFORME_PAR_DEFAUT.notifications.templates.loginFailure),
        paymentOverdue: versTexte(templates.paymentOverdue, POLITIQUE_PLATEFORME_PAR_DEFAUT.notifications.templates.paymentOverdue),
        apiError: versTexte(templates.apiError, POLITIQUE_PLATEFORME_PAR_DEFAUT.notifications.templates.apiError),
      },
    },
    branding: {
      appName: versTexte(branding.appName, POLITIQUE_PLATEFORME_PAR_DEFAUT.branding.appName),
      logoUrl: versTexte(branding.logoUrl, POLITIQUE_PLATEFORME_PAR_DEFAUT.branding.logoUrl),
      primaryColor: versTexte(branding.primaryColor, POLITIQUE_PLATEFORME_PAR_DEFAUT.branding.primaryColor),
      footerText: versTexte(branding.footerText, POLITIQUE_PLATEFORME_PAR_DEFAUT.branding.footerText),
    },
    auditCompliance: {
      retentionDays: bornerNombre(
        audit.retentionDays,
        1,
        3650,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.auditCompliance.retentionDays
      ),
      autoExportEnabled: versBoolean(
        audit.autoExportEnabled,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.auditCompliance.autoExportEnabled
      ),
      autoExportFormat:
        audit.autoExportFormat === 'json' || audit.autoExportFormat === 'csv'
          ? audit.autoExportFormat
          : POLITIQUE_PLATEFORME_PAR_DEFAUT.auditCompliance.autoExportFormat,
      autoExportIntervalHours: bornerNombre(
        audit.autoExportIntervalHours,
        1,
        168,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.auditCompliance.autoExportIntervalHours
      ),
      alertWebhookEnabled: versBoolean(
        audit.alertWebhookEnabled,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.auditCompliance.alertWebhookEnabled
      ),
      alertWebhookUrl: versTexteOptionnel(audit.alertWebhookUrl),
      alertWebhookSecret: versTexteOptionnel(audit.alertWebhookSecret),
      alertOnApiError: versBoolean(
        audit.alertOnApiError,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.auditCompliance.alertOnApiError
      ),
      alertOnSecurityEvent: versBoolean(
        audit.alertOnSecurityEvent,
        POLITIQUE_PLATEFORME_PAR_DEFAUT.auditCompliance.alertOnSecurityEvent
      ),
    },
  }
}

function interpolerTemplate(template: string, payload: Record<string, unknown>): string {
  return String(template || '').replace(/\{([^}]+)\}/g, (_, cleBrute: string) => {
    const cle = String(cleBrute || '').trim()
    const valeur = payload[cle]
    return valeur == null ? '' : String(valeur)
  })
}

function estEvenementNotificationActif(
  politique: TypePolitiquePlateforme,
  evenement: 'maintenance' | 'login_failure' | 'payment_overdue' | 'api_error'
): boolean {
  if (evenement === 'maintenance') return politique.notifications.events.maintenance
  if (evenement === 'login_failure') return politique.notifications.events.loginFailure
  if (evenement === 'payment_overdue') return politique.notifications.events.paymentOverdue
  return politique.notifications.events.apiError
}

function resoudreTemplateNotification(
  politique: TypePolitiquePlateforme,
  evenement: 'maintenance' | 'login_failure' | 'payment_overdue' | 'api_error'
): string {
  if (evenement === 'maintenance') return politique.notifications.templates.maintenance
  if (evenement === 'login_failure') return politique.notifications.templates.loginFailure
  if (evenement === 'payment_overdue') return politique.notifications.templates.paymentOverdue
  return politique.notifications.templates.apiError
}

export function normaliserCheminRegle(chemin: string): string {
  const brut = String(chemin || '')
  const sansQuery = brut.split('?')[0] || '/'
  if (sansQuery === '/api') return '/'
  if (sansQuery.startsWith('/api/')) return sansQuery.slice(4)
  return sansQuery
}

export function estMethodeEcriture(methode: string): boolean {
  const methodeNormalisee = String(methode || 'GET').toUpperCase()
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(methodeNormalisee)
}

export async function lirePolitiquePlateforme(
  prisma: PrismaClient
): Promise<TypePolitiquePlateforme> {
  const maintenant = Date.now()
  if (cachePolitique && cachePolitique.expireLe > maintenant) {
    return cachePolitique.politique
  }
  if (promesseLecturePolitique) {
    return promesseLecturePolitique
  }

  promesseLecturePolitique = (async () => {
    try {
      const parametre = await prisma.parametreAdmin.findFirst({
        where: { cle: CLE_PARAMETRE_POLITIQUE_GLOBALE },
        orderBy: { misAJourLe: 'desc' },
        select: { valeur: true },
      })
      const brute = String(parametre?.valeur || '').trim()
      const politique = brute
        ? normaliserPolitique(JSON.parse(brute))
        : POLITIQUE_PLATEFORME_PAR_DEFAUT

      cachePolitique = {
        expireLe: Date.now() + DUREE_CACHE_POLITIQUE_MS,
        politique,
      }
      return politique
    } catch {
      const fallback = POLITIQUE_PLATEFORME_PAR_DEFAUT
      cachePolitique = {
        expireLe: Date.now() + DUREE_CACHE_POLITIQUE_MS,
        politique: fallback,
      }
      return fallback
    } finally {
      promesseLecturePolitique = null
    }
  })()

  return promesseLecturePolitique
}

export async function envoyerAlerteConformiteDepuisPolitique(options: {
  prisma: PrismaClient
  type: 'api_error' | 'security'
  evenement: 'maintenance' | 'login_failure' | 'payment_overdue' | 'api_error'
  payload: Record<string, unknown>
}): Promise<boolean> {
  try {
    const politique = await lirePolitiquePlateforme(options.prisma)
    const audit = politique.auditCompliance
    if (!audit.alertWebhookEnabled) return false

    if (options.type === 'api_error' && !audit.alertOnApiError) return false
    if (options.type === 'security' && !audit.alertOnSecurityEvent) return false

    if (!estEvenementNotificationActif(politique, options.evenement)) return false

    const webhookUrl = String(audit.alertWebhookUrl || '').trim()
    if (!webhookUrl) return false

    const template = resoudreTemplateNotification(politique, options.evenement)
    const message = interpolerTemplate(template, options.payload)

    const reponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(audit.alertWebhookSecret
          ? { 'x-kya-webhook-secret': String(audit.alertWebhookSecret || '').trim() }
          : {}),
      },
      body: JSON.stringify({
        source: 'next-backend',
        type: options.type,
        event: options.evenement,
        sentAt: new Date().toISOString(),
        channels: politique.notifications.channels,
        message,
        payload: options.payload,
      }),
    })

    return reponse.ok
  } catch {
    return false
  }
}

export async function appliquerRetentionsDepuisPolitique(prisma: PrismaClient): Promise<void> {
  const maintenant = Date.now()
  if (maintenant - dernierSweepRetention < DUREE_COOLDOWN_RETENTION_MS) return
  dernierSweepRetention = maintenant

  try {
    const politique = await lirePolitiquePlateforme(prisma)
    const retentionAuditDays = Math.max(1, Number(politique.auditCompliance.retentionDays || 1))
    const retentionDocumentsDays = Math.max(1, Number(politique.documents.retentionDays || 1))
    const limiteAudit = new Date(maintenant - retentionAuditDays * 24 * 60 * 60 * 1000)
    const limiteDocuments = new Date(maintenant - retentionDocumentsDays * 24 * 60 * 60 * 1000)

    await Promise.all([
      prisma.journalAudit.deleteMany({
        where: { creeLe: { lt: limiteAudit } },
      }),
      prisma.document.deleteMany({
        where: { dateAjout: { lt: limiteDocuments } },
      }),
    ])
  } catch {
    // best effort
  }
}
