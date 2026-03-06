import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { adapterUtilisateurAuthentifieFrontend } from '@/src/infrastructure/http/adapterUtilisateurAuthentifieFrontend'
import { lirePolitiquePlateforme } from '@/src/infrastructure/http/politiquePlateforme'

/**
 * @swagger
 * /api/authContext/rafraichir:
 *   post:
 *     summary: Rafraichit la session avec rotation de refresh token + detection de reutilisation
 *     description: >
 *       Exige le cookie `kya_refresh_token` et l'entete `x-csrf-token`
 *       (valeur identique au cookie `kya_csrf_token`).
 *     tags:
 *       - Authentification
 *     security:
 *       - refreshTokenCookie: []
 *         csrfHeader: []
 *     parameters:
 *       - in: header
 *         name: x-csrf-token
 *         required: true
 *         schema:
 *           type: string
 *         description: Double submit token, doit correspondre au cookie kya_csrf_token.
 *     responses:
 *       200:
 *         description: Session rafraichie
 *       401:
 *         description: Refresh token invalide ou compromis
 *       403:
 *         description: CSRF invalide ou origine non autorisee
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
      user: adapterUtilisateurAuthentifieFrontend(resultat.user),
    })

    const politique = await lirePolitiquePlateforme(conteneurDependances.prisma)
    const dureeJetonAccesSecondes = conteneurDependances.configurationSecurite.dureeJetonAccesSecondes()
    const dureeSessionSecondes = Math.max(
      60,
      Math.floor(Number(politique.sessionSecurity.sessionDurationMinutes || 0) * 60) ||
        conteneurDependances.configurationSecurite.dureeSessionSecondes()
    )
    const dureeJetonRefreshSecondes = Math.min(
      conteneurDependances.configurationSecurite.dureeJetonRefreshSecondes(),
      dureeSessionSecondes
    )

    conteneurDependances.serviceCookiesAuthentification.ecrireCookiesRafraichissement(
      reponse,
      resultat.jetonAcces,
      resultat.jetonRefresh,
      resultat.csrfToken,
      dureeJetonAccesSecondes,
      dureeJetonRefreshSecondes
    )

    return reponse
  }
)
