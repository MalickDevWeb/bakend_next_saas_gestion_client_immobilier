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
        const [statutPaiement, politique] = await Promise.all([
          conteneurDependances.controleurAdministrationAdmin.obtenirStatutPaiementAdmin(
            jetonAcces,
            impersonation,
            new URL(requete.url)
          ),
          lirePolitiquePlateforme(conteneurDependances.prisma),
        ])

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

        const corpsNormalise: Record<string, unknown> = {
          ...corps,
          amount: montantNormalise,
          method: methode,
          provider,
          month: moisRequis,
          note: notePaiement,
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
