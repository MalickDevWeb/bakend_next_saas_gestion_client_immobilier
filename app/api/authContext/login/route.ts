import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext/login:
 *   post:
 *     summary: Connexion avec rotation refresh token et cookies securises
 *     description: >
 *       Authentifie un utilisateur et ecrit les cookies `kya_access_token`, `kya_refresh_token`,
 *       `kya_csrf_token`. Le token n'est pas renvoye dans le JSON.
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifiant, motDePasse]
 *             properties:
 *               identifiant:
 *                 type: string
 *                 description: Nom utilisateur, email ou numero de telephone
 *               motDePasse:
 *                 type: string
 *                 format: password
 *           examples:
 *             format_recommande:
 *               summary: Format recommande
 *               value:
 *                 identifiant: pmtfrommd
 *                 motDePasse: PaMaT1732771719013
 *             format_legacy:
 *               summary: Le backend accepte aussi username/password (legacy)
 *               value:
 *                 username: pmtfrommd
 *                 password: PaMaT1732771719013
 *     responses:
 *       200:
 *         description: Utilisateur authentifie, cookies de session emis
 *       401:
 *         description: Identifiants invalides
 *       403:
 *         description: Origine non autorisee (CORS strict)
 *       429:
 *         description: Trop de tentatives
 */
export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const corps = (await requete.json().catch(() => ({}))) as Record<string, unknown>
    const identifiant =
      String(corps.identifiant || corps.username || corps.email || '').trim()
    const motDePasse = String(corps.motDePasse || corps.password || '')

    const resultat = await conteneurDependances.controleurAuthContext.connexion(
      { identifiant, motDePasse },
      conteneurDependances.contexteRequeteHttp.extraireSecurite(requete)
    )

    const reponse = conteneurDependances.reponseHttp.succes({
      user: resultat.user,
    })

    conteneurDependances.serviceCookiesAuthentification.ecrireCookiesConnexion(
      reponse,
      resultat.jetonAcces,
      resultat.jetonRefresh,
      resultat.csrfToken,
      conteneurDependances.configurationSecurite.dureeJetonAccesSecondes(),
      conteneurDependances.configurationSecurite.dureeJetonRefreshSecondes()
    )

    return reponse
  }
)
