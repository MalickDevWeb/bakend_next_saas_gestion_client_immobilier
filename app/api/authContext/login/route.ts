import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/authContext/login:
 *   post:
 *     summary: Connexion avec rotation refresh token et cookies securises
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifiant:
 *                 type: string
 *               username:
 *                 type: string
 *               motDePasse:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur authentifie
 *       401:
 *         description: Identifiants invalides
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
