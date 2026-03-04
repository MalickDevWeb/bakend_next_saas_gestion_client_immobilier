import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/securite/audits:
 *   get:
 *     summary: Liste les derniers evenements d audit securite (RBAC serveur)
 *     tags:
 *       - Securite
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *           default: 100
 *         description: Nombre maximal d evenements retournes
 *     responses:
 *       200:
 *         description: Historique audit
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Permission manquante, seconde auth requise, ou origine non autorisee
 */
export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const limite = requete.nextUrl.searchParams.get('limite')
    const resultat = await conteneurDependances.controleurAuthContext.listerAuditsSecurite(
      jetonAcces,
      limite
    )
    return conteneurDependances.reponseHttp.succes(resultat)
  }
)
