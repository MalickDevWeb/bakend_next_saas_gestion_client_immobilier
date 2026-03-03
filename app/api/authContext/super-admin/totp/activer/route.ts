import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext/super-admin/totp/activer:
 *   post:
 *     summary: Active TOTP sur le compte Super Admin
 *     tags:
 *       - Authentification
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
      impersonation: null,
    })
  }
)
