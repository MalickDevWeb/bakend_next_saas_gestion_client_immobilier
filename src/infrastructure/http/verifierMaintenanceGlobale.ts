import type { PrismaClient } from '@prisma/client'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'
import {
  envoyerAlerteConformiteDepuisPolitique,
  estMethodeEcriture,
  lirePolitiquePlateforme,
  normaliserCheminRegle,
  POLITIQUE_PLATEFORME_PAR_DEFAUT,
} from '@/src/infrastructure/http/politiquePlateforme'

const MESSAGE_MAINTENANCE_PAR_DEFAUT = POLITIQUE_PLATEFORME_PAR_DEFAUT.maintenance.message
const DUREE_THROTTLE_ALERTE_MAINTENANCE_MS = 30_000
let derniereAlerteMaintenance = 0

type TypeEtatMaintenanceGlobale = {
  active: boolean
  message: string
  source: 'env' | 'setting'
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

export async function lireEtatMaintenanceGlobale(
  prisma: PrismaClient
): Promise<TypeEtatMaintenanceGlobale> {
  const etatDepuisEnv = lireEtatMaintenanceDepuisVariablesEnvironnement()
  if (etatDepuisEnv) return etatDepuisEnv

  const politique = await lirePolitiquePlateforme(prisma)
  return {
    active: Boolean(politique.maintenance.enabled),
    message: String(politique.maintenance.message || MESSAGE_MAINTENANCE_PAR_DEFAUT),
    source: 'setting',
  }
}

export async function verifierMaintenanceGlobaleMutation(
  prisma: PrismaClient,
  methode: string,
  chemin: string
): Promise<void> {
  if (!estMethodeEcriture(methode)) return

  const cheminNormalise = normaliserCheminRegle(chemin)
  if (estCheminExempteMaintenance(cheminNormalise)) return

  const etat = await lireEtatMaintenanceGlobale(prisma)
  if (!etat.active) return

  const maintenant = Date.now()
  if (maintenant - derniereAlerteMaintenance >= DUREE_THROTTLE_ALERTE_MAINTENANCE_MS) {
    derniereAlerteMaintenance = maintenant
    void envoyerAlerteConformiteDepuisPolitique({
      prisma,
      type: 'security',
      evenement: 'maintenance',
      payload: {
        message: etat.message,
        path: cheminNormalise,
        method: String(methode || '').toUpperCase(),
        source: etat.source,
      },
    })
  }

  throw new ErreurHttp(CODE_HTTP.SERVICE_INDISPONIBLE, etat.message, {
    code: 'MAINTENANCE_MODE',
    legacyCode: 'MAINTENANCE_ACTIVE',
    source: etat.source,
  })
}
