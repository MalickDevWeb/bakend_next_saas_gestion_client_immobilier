import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { executerMutationIdempotenteSiDemandee } from '@/src/infrastructure/http/executerMutationIdempotente'
import { lirePolitiquePlateforme } from '@/src/infrastructure/http/politiquePlateforme'

export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
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
        const politique = await lirePolitiquePlateforme(conteneurDependances.prisma)
        const retentionDays = Math.max(
          1,
          Math.floor(Number(politique.auditCompliance.retentionDays || 1))
        )
        const resultat =
          await conteneurDependances.controleurAdministrationAdmin.appliquerRetentionJournauxAudit(
            jetonAcces,
            impersonation,
            retentionDays
          )

        return conteneurDependances.reponseHttp.succes({
          ...resultat,
          retentionDays,
        })
      },
    })
  }
)
