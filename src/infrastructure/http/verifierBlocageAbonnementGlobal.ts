import type { PrismaClient } from '@prisma/client'
import type { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'
import {
  envoyerAlerteConformiteDepuisPolitique,
  estMethodeEcriture,
  lirePolitiquePlateforme,
  normaliserCheminRegle,
} from '@/src/infrastructure/http/politiquePlateforme'

function estCheminExempteBlocageAbonnement(cheminNormalise: string): boolean {
  return (
    cheminNormalise.startsWith('/admin_payments') ||
    cheminNormalise.startsWith('/settings') ||
    cheminNormalise.startsWith('/audit_logs') ||
    cheminNormalise.startsWith('/auth') ||
    cheminNormalise.startsWith('/authContext') ||
    cheminNormalise.startsWith('/undo-actions') ||
    cheminNormalise === '/sign' ||
    cheminNormalise.startsWith('/cloudinary/open-url')
  )
}

function calculerEcheanceBlocage(
  moisEnRetard: string | null,
  echeanceBrute: Date | null,
  graceDays: number
): Date | null {
  const grace = Math.max(0, Math.floor(Number(graceDays || 0)))
  const base =
    echeanceBrute instanceof Date && Number.isFinite(echeanceBrute.getTime())
      ? new Date(echeanceBrute)
      : null
  if (base) {
    base.setDate(base.getDate() + grace)
    return base
  }

  const mois = String(moisEnRetard || '').trim()
  if (!/^\d{4}-\d{2}$/.test(mois)) return null
  const annee = Number(mois.slice(0, 4))
  const moisIndex = Number(mois.slice(5, 7)) - 1
  if (!Number.isFinite(annee) || !Number.isFinite(moisIndex) || moisIndex < 0 || moisIndex > 11) {
    return null
  }

  const finMois = new Date(Date.UTC(annee, moisIndex + 1, 0, 23, 59, 59, 999))
  finMois.setUTCDate(finMois.getUTCDate() + grace)
  return finMois
}

function extraireRoleUtilisateur(contexteSession: { utilisateur: { role?: string | null } }): string {
  return String(contexteSession.utilisateur?.role || '').trim().toUpperCase()
}

type TypeServiceAuthentificationBlocage = {
  obtenirContexteDepuisJetonAcces: (
    jetonAcces: string
  ) => Promise<{ utilisateur: { id?: string | null; role?: string | null } }>
}

export async function verifierBlocageAbonnementMutation(options: {
  prisma: PrismaClient
  serviceAuthentification: TypeServiceAuthentificationBlocage
  jetonAcces: string
  impersonation?: DtoEtatImpersonation
  methode: string
  chemin: string
}): Promise<void> {
  if (!estMethodeEcriture(options.methode)) return

  const cheminNormalise = normaliserCheminRegle(options.chemin)
  if (estCheminExempteBlocageAbonnement(cheminNormalise)) return

  const politique = await lirePolitiquePlateforme(options.prisma)
  if (!politique.paymentRules.blockOnOverdue) return

  const contexteSession = await options.serviceAuthentification.obtenirContexteDepuisJetonAcces(
    options.jetonAcces
  )
  const role = extraireRoleUtilisateur(contexteSession)

  // Le blocage abonnement s'applique aux actions metier des comptes ADMIN.
  if (role !== 'ADMIN') return

  const utilisateurId = String(contexteSession.utilisateur.id || '').trim()
  if (!utilisateurId) return

  const profilAdmin = await options.prisma.admin.findUnique({
    where: { utilisateurId },
    select: { id: true },
  })

  const candidatsAdminId = [...new Set([utilisateurId, String(profilAdmin?.id || '').trim()].filter(Boolean))]
  if (candidatsAdminId.length === 0) return

  const statut = await options.prisma.statutAbonnementAdmin.findFirst({
    where: {
      adminId: {
        in: candidatsAdminId,
      },
    },
    orderBy: { misAJourLe: 'desc' },
    select: {
      adminId: true,
      bloque: true,
      moisEnRetard: true,
      echeance: true,
    },
  })

  if (!statut) return

  const enRetard = Boolean(statut.bloque) || Boolean(statut.moisEnRetard)
  if (!enRetard) return

  const dueAt = calculerEcheanceBlocage(
    statut.moisEnRetard,
    statut.echeance,
    politique.paymentRules.graceDays
  )
  if (dueAt && Date.now() <= dueAt.getTime()) {
    return
  }

  void envoyerAlerteConformiteDepuisPolitique({
    prisma: options.prisma,
    type: 'security',
    evenement: 'payment_overdue',
    payload: {
      adminId: statut.adminId,
      month: statut.moisEnRetard || null,
      dueAt: dueAt ? dueAt.toISOString() : null,
      path: cheminNormalise,
      method: String(options.methode || '').toUpperCase(),
    },
  })

  throw new ErreurHttp(
    CODE_HTTP.PAIEMENT_REQUIS,
    "Abonnement admin impaye: acces limite a la page d'abonnement",
    {
      code: 'ADMIN_SUBSCRIPTION_BLOCKED',
      adminId: statut.adminId,
      overdueMonth: statut.moisEnRetard || null,
      dueAt: dueAt ? dueAt.toISOString() : null,
    }
  )
}
