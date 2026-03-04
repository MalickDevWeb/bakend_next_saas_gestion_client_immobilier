import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext/super-admin/totp/statut:
 *   get:
 *     summary: Retourne le statut d activation TOTP du Super Admin
 *     tags:
 *       - Authentification
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut TOTP
 *       403:
 *         description: Reserve au Super Admin ou origine non autorisee
 */
export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const resultat = await conteneurDependances.controleurAuthContext.statutTotpSuperAdmin(jetonAcces)
    return conteneurDependances.reponseHttp.succes(resultat)
  }
)
