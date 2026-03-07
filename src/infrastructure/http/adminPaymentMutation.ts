import { ServiceAdministrationAdminConstructeursSysteme } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursSysteme'
import type { EntitePaiementAbonnementAdmin } from '@/src/domaine/entites/administration/EntitePaiementAbonnementAdmin'
import type { InterfaceDaoPaiementAbonnementAdmin, InterfaceDaoStatutAbonnementAdmin } from '@/src/domaine/interfaces/dao'

const constructeur = new ServiceAdministrationAdminConstructeursSysteme()

function normaliserTexte(valeur: unknown): string {
  return String(valeur || '').trim()
}

function joindreNotes(...valeurs: Array<string | null | undefined>): string {
  return valeurs
    .map((valeur) => normaliserTexte(valeur))
    .filter(Boolean)
    .join(' | ')
}

function serialiserPaiement(entite: EntitePaiementAbonnementAdmin): Record<string, unknown> {
  return {
    id: entite.id,
    adminId: entite.adminId,
    entrepriseId: entite.entrepriseId,
    amount: entite.montant,
    method: entite.methode,
    month: entite.mois,
    status: entite.statut,
    provider: entite.fournisseur,
    providerReference: entite.referenceFournisseur,
    checkoutUrl: entite.urlPaiement,
    payerPhone: entite.telephonePayeur,
    transactionRef: entite.referenceTransaction,
    note: entite.note,
    paidAt: entite.payeLe ? entite.payeLe.toISOString() : null,
    approvedAt: entite.approuveLe ? entite.approuveLe.toISOString() : null,
    approvedBy: entite.approuvePar,
    subscriptionMode: entite.modeAbonnement,
    createdAt: entite.creeLe.toISOString(),
  }
}

export async function mettreAJourPaiementAdminEtStatut(options: {
  paiement: EntitePaiementAbonnementAdmin
  daoPaiementAbonnementAdmin: InterfaceDaoPaiementAbonnementAdmin
  daoStatutAbonnementAdmin: InterfaceDaoStatutAbonnementAdmin
  status?: 'pending' | 'paid' | 'failed' | 'cancelled'
  checkoutUrl?: string
  providerReference?: string
  transactionRef?: string
  paidAt?: string | null
  approvedAt?: string | null
  approvedBy?: string | null
  note?: string
}): Promise<EntitePaiementAbonnementAdmin> {
  const fusion = {
    ...serialiserPaiement(options.paiement),
    status: options.status ?? options.paiement.statut,
    checkoutUrl:
      Object.prototype.hasOwnProperty.call(options, 'checkoutUrl')
        ? options.checkoutUrl || ''
        : options.paiement.urlPaiement,
    providerReference:
      Object.prototype.hasOwnProperty.call(options, 'providerReference')
        ? options.providerReference || ''
        : options.paiement.referenceFournisseur,
    transactionRef:
      Object.prototype.hasOwnProperty.call(options, 'transactionRef')
        ? options.transactionRef || ''
        : options.paiement.referenceTransaction,
    paidAt:
      Object.prototype.hasOwnProperty.call(options, 'paidAt')
        ? options.paidAt || null
        : options.paiement.payeLe
          ? options.paiement.payeLe.toISOString()
          : null,
    approvedAt:
      Object.prototype.hasOwnProperty.call(options, 'approvedAt')
        ? options.approvedAt || null
        : options.paiement.approuveLe
          ? options.paiement.approuveLe.toISOString()
          : null,
    approvedBy:
      Object.prototype.hasOwnProperty.call(options, 'approvedBy')
        ? options.approvedBy || null
        : options.paiement.approuvePar,
    note: joindreNotes(options.paiement.note, options.note),
  }

  const entite = constructeur.construireEntitePaiementAdminDepuisCorps(fusion, options.paiement.id)
  await options.daoPaiementAbonnementAdmin.sauvegarder(entite)
  await constructeur.mettreAJourStatutDepuisPaiementAdmin(entite, options.daoStatutAbonnementAdmin)
  return entite
}
