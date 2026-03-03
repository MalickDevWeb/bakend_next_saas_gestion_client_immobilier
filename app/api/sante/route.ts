import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

/**
 * @swagger
 * /api/sante:
 *   get:
 *     summary: Verifie l'etat du serveur
 *     parameters:
 *       - in: query
 *         name: verbeux
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Inclut des informations supplementaires
 *     responses:
 *       200:
 *         description: Serveur operationnel
 */
export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const verbeux = requete.nextUrl.searchParams.get('verbeux')
    const resultat = await conteneurDependances.controleurSante.traiterRequete({ verbeux })
    return conteneurDependances.reponseHttp.succes(resultat)
  }
)
