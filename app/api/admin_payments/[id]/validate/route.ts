import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'
import { mettreAJourPaiementAdminEtStatut } from '@/src/infrastructure/http/adminPaymentMutation'
import { publierEvenementPaiementAbonnementAdminSuperAdmin } from '@/app/api/admin_payments/notificationPaiementsAdmin'
import type { EntitePaiementAbonnementAdmin } from '@/src/domaine/entites/administration/EntitePaiementAbonnementAdmin'

type ParametresRoute = { params: Promise<{ id: string }> }

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
    const { id } = await contexte.params
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const contexteSession =
      await conteneurDependances.serviceAuthentification.obtenirContexteDepuisJetonAcces(jetonAcces)
    const utilisateur = contexteSession.utilisateur
    const role = String(utilisateur.role || '').trim().toUpperCase()

    if (role === 'SUPER_ADMIN') {
      await conteneurDependances.serviceAuthentification.exigerSecondeAuthSuperAdmin(jetonAcces)
    } else if (role !== 'ADMIN') {
      throw new ErreurHttp(CODE_HTTP.INTERDIT, 'Validation de paiement non autorisee.')
    }

    const paiement = await conteneurDependances.daoPaiementAbonnementAdmin.rechercherParId(id)
    if (!paiement) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, 'Paiement admin introuvable.')
    }

    if (role === 'ADMIN' && paiement.adminId !== String(utilisateur.id || '').trim()) {
      throw new ErreurHttp(CODE_HTTP.INTERDIT, 'Vous ne pouvez valider que vos propres paiements.')
    }

    const corps = (await requete.json().catch(() => ({}))) as Record<string, unknown>
    const note = String(corps.note || '').trim() || 'Paiement valide manuellement.'
    const maintenant = new Date().toISOString()

    const resultat = await mettreAJourPaiementAdminEtStatut({
      paiement,
      daoPaiementAbonnementAdmin: conteneurDependances.daoPaiementAbonnementAdmin,
      daoStatutAbonnementAdmin: conteneurDependances.daoStatutAbonnementAdmin,
      status: 'paid',
      paidAt: maintenant,
      approvedAt: maintenant,
      approvedBy: String(utilisateur.id || '').trim() || null,
      note,
    })

    try {
      await publierEvenementPaiementAbonnementAdminSuperAdmin(
        mapperPaiement(resultat)
      )
    } catch {
      // Notification best-effort.
    }

    return conteneurDependances.reponseHttp.succes(mapperPaiement(resultat))
  }
)
