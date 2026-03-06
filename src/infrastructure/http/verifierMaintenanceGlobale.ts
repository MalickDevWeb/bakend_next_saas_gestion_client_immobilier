import type { PrismaClient } from '@prisma/client'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'

const CLE_PARAMETRE_MAINTENANCE_GLOBALE = 'platform_config_v1'
const MESSAGE_MAINTENANCE_PAR_DEFAUT =
  "Maintenance en cours. Les actions d'ecriture sont temporairement desactivees."
const DUREE_CACHE_MAINTENANCE_MS = 15_000

type TypeEtatMaintenanceGlobale = {
  active: boolean
  message: string
  source: 'env' | 'setting' | 'default'
}

let cacheEtatMaintenance: { expireLe: number; etat: TypeEtatMaintenanceGlobale } | null = null
let promesseLectureEtatMaintenance: Promise<TypeEtatMaintenanceGlobale> | null = null

function estMethodeEcriture(methode: string): boolean {
  const methodeNormalisee = String(methode || 'GET').toUpperCase()
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(methodeNormalisee)
}

function normaliserChemin(chemin: string): string {
  const brut = String(chemin || '')
  const sansQuery = brut.split('?')[0] || '/'
  if (sansQuery === '/api') return '/'
  if (sansQuery.startsWith('/api/')) return sansQuery.slice(4)
  return sansQuery
}

function estCheminExempteMaintenance(cheminNormalise: string): boolean {
  return (
    cheminNormalise.startsWith('/settings') ||
    cheminNormalise.startsWith('/audit_logs') ||
    cheminNormalise.startsWith('/auth') ||
    cheminNormalise.startsWith('/authContext') ||
    cheminNormalise.startsWith('/undo-actions') ||
    cheminNormalise === '/sign' ||
    cheminNormalise.startsWith('/cloudinary/open-url')
  )
}

function lireEtatMaintenanceDepuisVariablesEnvironnement(): TypeEtatMaintenanceGlobale | null {
  if (String(process.env.MAINTENANCE_ACTIVE || '').trim().toLowerCase() !== 'true') {
    return null
  }

  const message =
    String(process.env.MAINTENANCE_MESSAGE || '').trim() || MESSAGE_MAINTENANCE_PAR_DEFAUT
  return {
    active: true,
    message,
    source: 'env',
  }
}

function parserEtatMaintenanceDepuisParametre(
  valeurParametre: string | null | undefined
): Pick<TypeEtatMaintenanceGlobale, 'active' | 'message'> | null {
  const brute = String(valeurParametre || '').trim()
  if (!brute) return null

  try {
    const payload = JSON.parse(brute) as {
      maintenance?: { enabled?: unknown; message?: unknown }
    }
    const maintenance = payload?.maintenance
    if (!maintenance || typeof maintenance !== 'object') return null

    const active =
      maintenance.enabled === true || String(maintenance.enabled || '').trim().toLowerCase() === 'true'
    const message =
      String(maintenance.message || '').trim() || MESSAGE_MAINTENANCE_PAR_DEFAUT
    return { active, message }
  } catch {
    return null
  }
}

export async function lireEtatMaintenanceGlobale(
  prisma: PrismaClient
): Promise<TypeEtatMaintenanceGlobale> {
  const etatDepuisEnv = lireEtatMaintenanceDepuisVariablesEnvironnement()
  if (etatDepuisEnv) return etatDepuisEnv

  const maintenant = Date.now()
  if (cacheEtatMaintenance && cacheEtatMaintenance.expireLe > maintenant) {
    return cacheEtatMaintenance.etat
  }
  if (promesseLectureEtatMaintenance) {
    return promesseLectureEtatMaintenance
  }

  promesseLectureEtatMaintenance = (async () => {
    try {
      const parametre = await prisma.parametreAdmin.findFirst({
        where: { cle: CLE_PARAMETRE_MAINTENANCE_GLOBALE },
        orderBy: { misAJourLe: 'desc' },
        select: { valeur: true },
      })

      const etatDepuisParametre = parserEtatMaintenanceDepuisParametre(parametre?.valeur)
      const etat: TypeEtatMaintenanceGlobale = etatDepuisParametre
        ? {
            active: etatDepuisParametre.active,
            message: etatDepuisParametre.message,
            source: 'setting',
          }
        : {
            active: false,
            message: MESSAGE_MAINTENANCE_PAR_DEFAUT,
            source: 'default',
          }

      cacheEtatMaintenance = {
        expireLe: Date.now() + DUREE_CACHE_MAINTENANCE_MS,
        etat,
      }
      return etat
    } catch {
      const fallback = lireEtatMaintenanceDepuisVariablesEnvironnement() || {
        active: false,
        message: MESSAGE_MAINTENANCE_PAR_DEFAUT,
        source: 'default' as const,
      }
      cacheEtatMaintenance = {
        expireLe: Date.now() + DUREE_CACHE_MAINTENANCE_MS,
        etat: fallback,
      }
      return fallback
    } finally {
      promesseLectureEtatMaintenance = null
    }
  })()

  return promesseLectureEtatMaintenance
}

export async function verifierMaintenanceGlobaleMutation(
  prisma: PrismaClient,
  methode: string,
  chemin: string
): Promise<void> {
  if (!estMethodeEcriture(methode)) return

  const cheminNormalise = normaliserChemin(chemin)
  if (estCheminExempteMaintenance(cheminNormalise)) return

  const etat = await lireEtatMaintenanceGlobale(prisma)
  if (!etat.active) return

  throw new ErreurHttp(CODE_HTTP.SERVICE_INDISPONIBLE, etat.message, {
    code: 'MAINTENANCE_ACTIVE',
    source: etat.source,
  })
}
