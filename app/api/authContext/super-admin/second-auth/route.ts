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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codeTotp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Seconde authentification validee
 *       401:
 *         description: Code invalide
 *       403:
 *         description: Reserve au Super Admin
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
