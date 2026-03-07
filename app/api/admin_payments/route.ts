import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { appliquerEntetesAnnulation } from '@/src/infrastructure/http/appliquerEntetesAnnulation'
import { executerMutationIdempotenteSiDemandee } from '@/src/infrastructure/http/executerMutationIdempotente'
import { lirePolitiquePlateforme } from '@/src/infrastructure/http/politiquePlateforme'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'
import {
  estPaiementAbonnementFinalise,
  publierEvenementPaiementAbonnementAdminSuperAdmin,
} from '@/app/api/admin_payments/notificationPaiementsAdmin'
import {
  calculerDisponibiliteProvidersPaiement,
  construireUrlWebhookPaiementProvider,
  initierPaiementProvider,
  lireConfigurationProvidersPaiement,
} from '@/src/infrastructure/http/adminPaymentProviders'

const MIN_AMOUNT_FCFA = 100
const MAX_AMOUNT_FCFA = 10_000_000

function normaliserTelephoneMobileMoney(valeur: unknown): string {
  const brut = String(valeur || '').trim()
  if (!brut) return ''
  const chiffres = brut.replace(/\D/g, '')
  if (chiffres.startsWith('221') && chiffres.length === 12) return `+${chiffres}`
  if (chiffres.length === 9 && chiffres.startsWith('7')) return `+221${chiffres}`
  if (brut.startsWith('+') && chiffres) return `+${chiffres}`
  return chiffres
}

function normaliserMethodePaiement(valeur: unknown): 'wave' | 'orange_money' | 'cash' {
  const methode = String(valeur || 'wave').trim().toLowerCase()
  if (methode === 'orange_money' || methode === 'cash') return methode
  return 'wave'
}

function joindreNotes(...elements: Array<string | null | undefined>): string {
  return elements
    .map((element) => String(element || '').trim())
    .filter(Boolean)
    .join(' | ')
}

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const donnees = await conteneurDependances.controleurAdministrationAdmin.listerPaiementsAdmin(
      jetonAcces,
      impersonation
    )
    return conteneurDependances.reponseHttp.succes(donnees)
  }
)

export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const corps = (await requete.json().catch(() => ({}))) as Record<string, unknown>

    return executerMutationIdempotenteSiDemandee({
      prisma: conteneurDependances.prisma,
      requete,
      jetonAcces,
      impersonation,
      corps,
      serviceAuthentification: conteneurDependances.serviceAuthentification,
      executerMutation: async () => {
        const [statutPaiement, politique, configurationProviders, contexteSession] = await Promise.all([
          conteneurDependances.controleurAdministrationAdmin.obtenirStatutPaiementAdmin(
            jetonAcces,
            impersonation,
            new URL(requete.url)
          ),
          lirePolitiquePlateforme(conteneurDependances.prisma),
          lireConfigurationProvidersPaiement(
            conteneurDependances.prisma,
            conteneurDependances.serviceChiffrement
          ),
          conteneurDependances.serviceAuthentification.obtenirContexteDepuisJetonAcces(jetonAcces),
        ])
        const disponibiliteProviders = calculerDisponibiliteProvidersPaiement(configurationProviders)

        const methode = normaliserMethodePaiement(corps.method || corps.methode)
        const montantAttendu = Number((statutPaiement as Record<string, unknown>).expectedAmount || 0)
        const montantLibreAutorise = Boolean(
          (statutPaiement as Record<string, unknown>).allowCustomAmount
        )
        const montantBrut = Number(corps.amount ?? corps.montant)
        const montantNormalise = montantLibreAutorise
          ? Number.isFinite(montantBrut)
            ? Math.round(montantBrut)
            : Math.round(montantAttendu)
          : Math.round(montantAttendu)

        if (!Number.isFinite(montantNormalise) || montantNormalise < MIN_AMOUNT_FCFA || montantNormalise > MAX_AMOUNT_FCFA) {
          throw new ErreurHttp(
            CODE_HTTP.MAUVAISE_REQUETE,
            'Montant de paiement admin invalide.'
          )
        }

        const numeroBeneficiaire =
          methode === 'wave'
            ? normaliserTelephoneMobileMoney(politique.paymentRules.waveRecipientPhone)
            : methode === 'orange_money'
            ? normaliserTelephoneMobileMoney(politique.paymentRules.orangeRecipientPhone)
            : ''

        if (methode !== 'cash' && !numeroBeneficiaire) {
          throw new ErreurHttp(
            CODE_HTTP.MAUVAISE_REQUETE,
            `Numéro bénéficiaire ${methode === 'wave' ? 'Wave' : 'Orange Money'} non configuré.`
          )
        }

        const provider =
          methode === 'wave' ? 'wave' : methode === 'orange_money' ? 'orange' : 'manual'
        const moisRequis = String(
          corps.month ||
            corps.mois ||
            (statutPaiement as Record<string, unknown>).requiredMonth ||
            ''
        ).trim()
        const notePaiement = joindreNotes(
          String(corps.note || ''),
          numeroBeneficiaire
            ? `Destinataire ${methode === 'wave' ? 'Wave' : 'Orange Money'}: ${numeroBeneficiaire}`
            : '',
          politique.paymentRules.recipientName
            ? `Compte: ${String(politique.paymentRules.recipientName || '').trim()}`
            : ''
        )
        const utilisateurId = String(contexteSession.utilisateur.id || '').trim() || null
        const modeWave = politique.paymentRules.waveMode || 'manual'
        const modeOrangeMoney = politique.paymentRules.orangeMoneyMode || 'manual'
        const validationManuelleActive = Boolean(politique.paymentRules.manualValidationEnabled)
        const waveActive = Boolean(politique.paymentRules.waveEnabled)
        const orangeMoneyActif = Boolean(politique.paymentRules.orangeMoneyEnabled)

        if (methode === 'wave' && !waveActive) {
          throw new ErreurHttp(CODE_HTTP.MAUVAISE_REQUETE, 'Le mode Wave est desactive par le Super Admin.')
        }

        if (methode === 'orange_money' && !orangeMoneyActif) {
          throw new ErreurHttp(
            CODE_HTTP.MAUVAISE_REQUETE,
            'Le mode Orange Money est desactive par le Super Admin.'
          )
        }

        const moisRequisNormalise = moisRequis || String((statutPaiement as Record<string, unknown>).requiredMonth || '').trim()
        const noteProvider =
          methode === 'wave'
            ? `Mode Wave: ${modeWave === 'api' ? 'API provider' : 'validation manuelle'}`
            : methode === 'orange_money'
              ? `Mode Orange Money: ${modeOrangeMoney === 'api' ? 'API provider' : 'validation manuelle'}`
              : 'Mode cash'

        let statutNormalise: 'pending' | 'paid' | 'failed' | 'cancelled' =
          methode === 'cash' ? 'paid' : 'pending'
        let checkoutUrl = ''
        let providerReference = ''
        let transactionRef = String(corps.transactionRef || corps.referenceTransaction || '').trim()
        let paidAt = methode === 'cash' ? new Date().toISOString() : null
        let approvedAt = methode === 'cash' ? new Date().toISOString() : null
        let approvedBy = methode === 'cash' ? utilisateurId : null

        if (methode === 'wave' || methode === 'orange_money') {
          const modeProvider = methode === 'wave' ? modeWave : modeOrangeMoney
          const apiConfiguree =
            methode === 'wave'
              ? disponibiliteProviders.waveApiConfigured
              : disponibiliteProviders.orangeMoneyApiConfigured

          if (modeProvider === 'api') {
            if (!apiConfiguree) {
              throw new ErreurHttp(
                CODE_HTTP.MAUVAISE_REQUETE,
                `Le mode API ${methode === 'wave' ? 'Wave' : 'Orange Money'} est actif mais les credentials ne sont pas complets.`
              )
            }

            const initiation = await initierPaiementProvider({
              provider: methode,
              amount: montantNormalise,
              adminId: String((corps.adminId as string) || (statutPaiement as Record<string, unknown>).adminId || '').trim(),
              entrepriseId: String(corps.entrepriseId || '').trim(),
              month: moisRequisNormalise,
              payerPhone: String(corps.payerPhone || corps.telephonePayeur || '').trim(),
              recipientPhone: numeroBeneficiaire,
              recipientName: String(politique.paymentRules.recipientName || '').trim(),
              callbackUrl: construireUrlWebhookPaiementProvider(new URL(requete.url).origin, methode),
              note: notePaiement,
              config: configurationProviders,
            })

            statutNormalise = initiation.status
            checkoutUrl = initiation.checkoutUrl
            providerReference = initiation.providerReference
            transactionRef = initiation.transactionRef || transactionRef
            paidAt = initiation.status === 'paid' ? initiation.paidAt || new Date().toISOString() : null
            approvedAt = null
            approvedBy = null
          } else if (!validationManuelleActive) {
            throw new ErreurHttp(
              CODE_HTTP.MAUVAISE_REQUETE,
              'La validation manuelle des paiements Mobile Money est desactivee.'
            )
          }
        }

        const corpsNormalise: Record<string, unknown> = {
          ...corps,
          amount: montantNormalise,
          method: methode,
          provider,
          month: moisRequisNormalise,
          note: joindreNotes(notePaiement, noteProvider, statutNormalise === 'pending' ? 'En attente de confirmation.' : ''),
          status: statutNormalise,
          checkoutUrl,
          providerReference,
          transactionRef,
          paidAt,
          approvedAt,
          approvedBy,
        }

        const resultat = await conteneurDependances.controleurAdministrationAdmin.creerPaiementAdmin(
          jetonAcces,
          impersonation,
          corpsNormalise
        )
        if (estPaiementAbonnementFinalise(resultat.donnees as Record<string, unknown>)) {
          try {
            await publierEvenementPaiementAbonnementAdminSuperAdmin(
              resultat.donnees as Record<string, unknown>
            )
          } catch {
            // Notification best-effort.
          }
        }
        const reponse = conteneurDependances.reponseHttp.succes(resultat.donnees)
        return appliquerEntetesAnnulation(reponse, resultat.annulation)
      },
    })
  }
)
