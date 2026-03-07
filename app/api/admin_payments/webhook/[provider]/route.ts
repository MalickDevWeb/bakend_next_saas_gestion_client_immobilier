import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import {
  extrairePayloadWebhookProvider,
  lireConfigurationProvidersPaiement,
  type TypePaiementProvider,
  verifierSignatureWebhookProvider,
} from '@/src/infrastructure/http/adminPaymentProviders'
import { mettreAJourPaiementAdminEtStatut } from '@/src/infrastructure/http/adminPaymentMutation'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'
import { publierEvenementPaiementAbonnementAdminSuperAdmin } from '@/app/api/admin_payments/notificationPaiementsAdmin'
import type { EntitePaiementAbonnementAdmin } from '@/src/domaine/entites/administration/EntitePaiementAbonnementAdmin'

type ParametresRoute = { params: Promise<{ provider: string }> }

function normaliserProvider(valeur: string): TypePaiementProvider {
  return String(valeur || '').trim().toLowerCase() === 'orange_money' ? 'orange_money' : 'wave'
}

function mapperPaiement(entite: EntitePaiementAbonnementAdmin): Record<string, unknown> {
  return {
    id: entite.id,
    adminId: entite.adminId,
    entrepriseId: entite.entrepriseId || '',
    amount: entite.montant,
    method: entite.methode,
    status: entite.statut,
    provider: entite.fournisseur || '',
    providerReference: entite.referenceFournisseur || '',
    checkoutUrl: entite.urlPaiement || '',
    payerPhone: entite.telephonePayeur || '',
    transactionRef: entite.referenceTransaction || '',
    note: entite.note || '',
    paidAt: entite.payeLe ? entite.payeLe.toISOString() : null,
    month: entite.mois,
    approvedAt: entite.approuveLe ? entite.approuveLe.toISOString() : null,
    approvedBy: entite.approuvePar || null,
    createdAt: entite.creeLe.toISOString(),
  }
}

export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { provider: providerBrut } = await contexte.params
    const provider = normaliserProvider(providerBrut)
    const configurationProviders = await lireConfigurationProvidersPaiement(
      conteneurDependances.prisma,
      conteneurDependances.serviceChiffrement
    )
    const rawBody = await requete.text()

    if (
      !verifierSignatureWebhookProvider({
        provider,
        rawBody,
        headers: requete.headers,
        config: configurationProviders,
      })
    ) {
      throw new ErreurHttp(CODE_HTTP.NON_AUTHENTIFIE, 'Signature webhook provider invalide.')
    }

    let webhookBody: unknown = {}
    try {
      webhookBody = rawBody ? JSON.parse(rawBody) : {}
    } catch {
      webhookBody = {}
    }

    const payload = extrairePayloadWebhookProvider(webhookBody)
    const paiements = await conteneurDependances.daoPaiementAbonnementAdmin.lister()
    const paiement =
      paiements.find((element) => element.id === payload.paymentId) ||
      paiements.find(
        (element) =>
          payload.providerReference &&
          element.referenceFournisseur === payload.providerReference
      ) ||
      paiements.find(
        (element) =>
          payload.transactionRef && element.referenceTransaction === payload.transactionRef
      )

    if (!paiement) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, 'Paiement admin cible introuvable.')
    }

    const etaitPaye = paiement.statut === 'paid'
    const resultat = await mettreAJourPaiementAdminEtStatut({
      paiement,
      daoPaiementAbonnementAdmin: conteneurDependances.daoPaiementAbonnementAdmin,
      daoStatutAbonnementAdmin: conteneurDependances.daoStatutAbonnementAdmin,
      status: payload.status,
      providerReference: payload.providerReference || paiement.referenceFournisseur,
      transactionRef: payload.transactionRef || paiement.referenceTransaction,
      paidAt: payload.status === 'paid' ? payload.paidAt || new Date().toISOString() : null,
      note: payload.note || `Webhook ${provider} reçu.`,
    })

    if (!etaitPaye && resultat.statut === 'paid') {
      try {
        await publierEvenementPaiementAbonnementAdminSuperAdmin(
          mapperPaiement(resultat)
        )
      } catch {
        // Notification best-effort.
      }
    }

    return conteneurDependances.reponseHttp.succes({
      ok: true,
      payment: mapperPaiement(resultat),
    })
  }
)
