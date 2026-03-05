import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { appliquerEntetesAnnulation } from '@/src/infrastructure/http/appliquerEntetesAnnulation'
import { executerMutationIdempotenteSiDemandee } from '@/src/infrastructure/http/executerMutationIdempotente'

const CLES_PARAMETRES_PUBLICS = new Set(['language', 'platform_config_v1'])

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const requeteUrl = new URL(requete.url)
    const cle = String(requeteUrl.searchParams.get('key') || '').trim()
    const lecturePublique = Boolean(cle) && CLES_PARAMETRES_PUBLICS.has(cle)

    try {
      const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
      const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
      const donnees = await conteneurDependances.controleurAdministrationAdmin.listerParametres(
        jetonAcces,
        impersonation,
        requeteUrl
      )
      return conteneurDependances.reponseHttp.succes(donnees)
    } catch (erreur) {
      if (lecturePublique) {
        return conteneurDependances.reponseHttp.succes([])
      }
      throw erreur
    }
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
        const resultat = await conteneurDependances.controleurAdministrationAdmin.creerParametre(
          jetonAcces,
          impersonation,
          corps
        )
        const reponse = conteneurDependances.reponseHttp.succes(resultat.donnees)
        return appliquerEntetesAnnulation(reponse, resultat.annulation)
      },
    })
  }
)
