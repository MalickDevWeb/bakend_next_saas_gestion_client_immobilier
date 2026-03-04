import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext:
 *   get:
 *     summary: Recupere le contexte d authentification courant
 *     tags:
 *       - Authentification
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contexte courant
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Origine non autorisee (CORS strict)
 */
export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const resultat = await conteneurDependances.controleurAuthContext.contexte(jetonAcces)
    const role = String(resultat.user?.role || '').toUpperCase()
    const impersonation =
      role === 'SUPER_ADMIN'
        ? conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
        : null

    const reponse = conteneurDependances.reponseHttp.succes({
      ...resultat,
      impersonation,
    })

    if (role !== 'SUPER_ADMIN') {
      conteneurDependances.serviceCookiesAuthentification.nettoyerCookieImpersonation(reponse)
    }
    return reponse
  }
)
