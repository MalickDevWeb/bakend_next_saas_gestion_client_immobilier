import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext/impersonate:
 *   post:
 *     summary: Active l impersonation d un ADMIN par un SUPER_ADMIN
 *     description: Endpoint reserve exclusivement au role SUPER_ADMIN. La cible doit etre un compte ADMIN actif existant.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adminId, adminName]
 *             properties:
 *               adminId:
 *                 type: string
 *               adminName:
 *                 type: string
 *               userId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Impersonation activee
 *       400:
 *         description: Cible admin invalide (inexistante, inactive ou role non ADMIN)
 *       403:
 *         description: Reserve au Super Admin ou CSRF/origine invalide
 */
export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const corps = (await requete.json().catch(() => ({}))) as Record<string, unknown>

    const impersonation = await conteneurDependances.controleurAuthContext.definirImpersonation(
      jetonAcces,
      corps
    )

    const reponse = conteneurDependances.reponseHttp.succes({
      ok: true,
      impersonation,
    })
    conteneurDependances.serviceCookiesAuthentification.ecrireCookieImpersonation(
      reponse,
      impersonation,
      conteneurDependances.configurationSecurite.dureeJetonRefreshSecondes()
    )
    return reponse
  }
)
