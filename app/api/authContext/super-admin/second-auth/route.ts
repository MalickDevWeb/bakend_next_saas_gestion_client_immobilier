import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext/super-admin/second-auth:
 *   post:
 *     summary: Valide la seconde authentification Super Admin (TOTP ou identifiant/mot de passe)
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
 *                 required: [identifiant, motDePasse]
 *                 properties:
 *                   identifiant:
 *                     type: string
 *                     description: Meme identifiant que le login (nom utilisateur, email ou numero)
 *                   motDePasse:
 *                     type: string
 *                     format: password
 *                     description: Meme mot de passe que le login
 *               - type: object
 *                 required: [numero, motDePasse]
 *                 properties:
 *                   numero:
 *                     type: string
 *                     description: Alias mobile de identifiant
 *                   motDePasse:
 *                     type: string
 *                     format: password
 *                     description: Meme mot de passe que le login
 *               - type: object
 *                 required: [username, password]
 *                 properties:
 *                   username:
 *                     type: string
 *                   password:
 *                     type: string
 *                     format: password
 *                     description: Alias legacy frontend
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
 *             mode_identifiants_recommande:
 *               summary: Verification par identifiant et mot de passe
 *               value:
 *                 identifiant: "771234567"
 *                 motDePasse: "PaMaT1732771719013"
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
