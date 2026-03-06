import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { appliquerEntetesAnnulation } from '@/src/infrastructure/http/appliquerEntetesAnnulation'
import { executerMutationIdempotenteSiDemandee } from '@/src/infrastructure/http/executerMutationIdempotente'
import {
  estPaiementAbonnementFinalise,
  publierEvenementPaiementAbonnementAdminSuperAdmin,
} from '@/app/api/admin_payments/notificationPaiementsAdmin'

type ParametresRoute = { params: Promise<{ id: string }> }

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id } = await contexte.params
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const donnees = await conteneurDependances.controleurAdministrationAdmin.obtenirPaiementAdmin(
      jetonAcces,
      impersonation,
      id
    )
    return conteneurDependances.reponseHttp.succes(donnees)
  }
)

const miseAJourPaiementAdmin = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id } = await contexte.params
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
        const donneesAvant = await conteneurDependances.controleurAdministrationAdmin.obtenirPaiementAdmin(
          jetonAcces,
          impersonation,
          id
        )
        const resultat = await conteneurDependances.controleurAdministrationAdmin.mettreAJourPaiementAdmin(
          jetonAcces,
          impersonation,
          id,
          corps
        )
        const etaitFinalise = estPaiementAbonnementFinalise(donneesAvant as Record<string, unknown>)
        const estFinalise = estPaiementAbonnementFinalise(resultat.donnees as Record<string, unknown>)
        if (!etaitFinalise && estFinalise) {
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

export const PUT = miseAJourPaiementAdmin
export const PATCH = miseAJourPaiementAdmin

export const DELETE = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id } = await contexte.params
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)

    return executerMutationIdempotenteSiDemandee({
      prisma: conteneurDependances.prisma,
      requete,
      jetonAcces,
      impersonation,
      corps: {},
      serviceAuthentification: conteneurDependances.serviceAuthentification,
      executerMutation: async () => {
        const resultat = await conteneurDependances.controleurAdministrationAdmin.supprimerPaiementAdmin(
          jetonAcces,
          impersonation,
          id
        )
        const reponse = conteneurDependances.reponseHttp.succes(resultat.donnees)
        return appliquerEntetesAnnulation(reponse, resultat.annulation)
      },
    })
  }
)
