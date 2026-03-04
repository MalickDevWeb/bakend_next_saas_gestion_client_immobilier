import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext/clear-impersonation:
 *   post:
 *     summary: Desactive l impersonation ADMIN active
 *     description: Endpoint reserve exclusivement au role SUPER_ADMIN.
 *     tags:
 *       - Authentification
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
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
 *         description: Impersonation desactivee
 *       403:
 *         description: Reserve au Super Admin ou CSRF/origine invalide
 */
export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    await conteneurDependances.controleurAuthContext.effacerImpersonation(jetonAcces)

    const reponse = conteneurDependances.reponseHttp.succes({
      ok: true,
      impersonation: null,
    })
    conteneurDependances.serviceCookiesAuthentification.nettoyerCookieImpersonation(reponse)
    return reponse
  }
)

