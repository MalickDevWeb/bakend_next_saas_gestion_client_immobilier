import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { lirePolitiquePlateforme } from '@/src/infrastructure/http/politiquePlateforme'

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const [donnees, politique] = await Promise.all([
      conteneurDependances.controleurAdministrationAdmin.obtenirStatutPaiementAdmin(
        jetonAcces,
        impersonation,
        new URL(requete.url)
      ),
      lirePolitiquePlateforme(conteneurDependances.prisma),
    ])

    const sortie = {
      ...(donnees as Record<string, unknown>),
      graceDays: politique.paymentRules.graceDays,
      blockOnOverdue: politique.paymentRules.blockOnOverdue,
      latePenaltyPercent: politique.paymentRules.latePenaltyPercent,
    }
    return conteneurDependances.reponseHttp.succes(sortie)
  }
)
