import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext/super-admin/second-auth:
 *   post:
 *     summary: Valide la seconde authentification Super Admin via TOTP
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
 *             oneOf:
 *               - type: object
 *                 required: [codeTotp]
 *                 properties:
 *                   codeTotp:
 *                     type: string
 *                     description: Code TOTP 6 chiffres
 *                     example: "123456"
 *               - type: object
 *                 required: [motDePasse]
 *                 properties:
 *                   motDePasse:
 *                     type: string
 *                     format: password
 *                     description: Mode compatible frontend actuel
 *               - type: object
 *                 required: [password]
 *                 properties:
 *                   password:
 *                     type: string
 *                     format: password
 *                     description: Alias legacy compatible frontend
 *           examples:
 *             mode_totp:
 *               summary: Verification par code TOTP
 *               value:
 *                 codeTotp: "123456"
 *             mode_password_frontend:
 *               summary: Verification compatible frontend
 *               value:
 *                 password: "PaMaT1732771719013"
 *     responses:
 *       200:
 *         description: Seconde authentification validee
 *       401:
 *         description: Code invalide
 *       403:
 *         description: Reserve au Super Admin ou CSRF/origine invalide
 *       412:
 *         description: TOTP non active
 */
export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const corps = await requete.json().catch(() => ({}))

    const resultat =
      await conteneurDependances.controleurAuthContext.verifierSecondeAuthSuperAdmin(
        jetonAcces,
        corps,
        conteneurDependances.contexteRequeteHttp.extraireSecurite(requete)
      )

    return conteneurDependances.reponseHttp.succes({
      ...resultat,
      impersonation: null,
    })
  }
)
