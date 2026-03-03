import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext/logout:
 *   post:
 *     summary: Termine la session active
 *     tags:
 *       - Authentification
 *     responses:
 *       200:
 *         description: Session terminee
 */
export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = requete.cookies.get('kya_access_token')?.value || null

    await conteneurDependances.controleurAuthContext.deconnexion(
      jetonAcces,
      conteneurDependances.contexteRequeteHttp.extraireSecurite(requete)
    )

    const reponse = conteneurDependances.reponseHttp.succes({ ok: true })
    conteneurDependances.serviceCookiesAuthentification.nettoyerCookies(reponse)
    return reponse
  }
)
