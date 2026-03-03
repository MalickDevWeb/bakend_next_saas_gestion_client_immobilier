import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext/rafraichir:
 *   post:
 *     summary: Rafraichit la session avec rotation de refresh token + detection de reutilisation
 *     tags:
 *       - Authentification
 *     responses:
 *       200:
 *         description: Session rafraichie
 *       401:
 *         description: Refresh token invalide ou compromis
 */
export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonRefresh =
      conteneurDependances.adaptateurRequeteSecurite.extraireJetonRefresh(requete)

    const resultat = await conteneurDependances.controleurAuthContext.rafraichir(
      jetonRefresh,
      conteneurDependances.contexteRequeteHttp.extraireSecurite(requete)
    )

    const reponse = conteneurDependances.reponseHttp.succes({
      user: resultat.user,
    })

    conteneurDependances.serviceCookiesAuthentification.ecrireCookiesRafraichissement(
      reponse,
      resultat.jetonAcces,
      resultat.jetonRefresh,
      resultat.csrfToken,
      conteneurDependances.configurationSecurite.dureeJetonAccesSecondes(),
      conteneurDependances.configurationSecurite.dureeJetonRefreshSecondes()
    )

    return reponse
  }
)
