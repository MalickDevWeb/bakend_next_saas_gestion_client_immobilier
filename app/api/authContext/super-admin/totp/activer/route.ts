import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { adapterUtilisateurAuthentifieFrontend } from '@/src/infrastructure/http/adapterUtilisateurAuthentifieFrontend'

/**
 * @swagger
 * /api/authContext/super-admin/totp/activer:
 *   post:
 *     summary: Active TOTP sur le compte Super Admin
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               secretTemporaire:
 *                 type: string
 *               codeTotp:
 *                 type: string
 *     responses:
 *       200:
 *         description: TOTP active
 *       401:
 *         description: Code invalide
 *       403:
 *         description: Reserve au Super Admin ou CSRF/origine invalide
 */
export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const corps = await requete.json().catch(() => ({}))
    const resultat = await conteneurDependances.controleurAuthContext.activerTotpSuperAdmin(
      jetonAcces,
      corps,
      conteneurDependances.contexteRequeteHttp.extraireSecurite(requete)
    )

    return conteneurDependances.reponseHttp.succes({
      ...resultat,
      user: adapterUtilisateurAuthentifieFrontend(resultat.user),
      impersonation: null,
    })
  }
)
