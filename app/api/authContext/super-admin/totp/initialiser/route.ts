import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext/super-admin/totp/initialiser:
 *   post:
 *     summary: Genere un secret TOTP temporaire + URL otpAuth pour Google Authenticator
 *     tags:
 *       - Authentification
 *     responses:
 *       200:
 *         description: Secret temporaire genere
 *       403:
 *         description: Reserve au Super Admin
 */
export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const resultat =
      await conteneurDependances.controleurAuthContext.initialiserTotpSuperAdmin(jetonAcces)
    return conteneurDependances.reponseHttp.succes(resultat)
  }
)
