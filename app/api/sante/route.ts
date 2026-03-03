import { NextRequest, NextResponse } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { ERRORS, t } from '@/src/messages'

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
export async function GET(requete: NextRequest) {
  try {
    const verbeux = requete.nextUrl.searchParams.get('verbeux')
    const resultat = await conteneurDependances.controleurSante.traiterRequete({ verbeux })
    return NextResponse.json(resultat)
  } catch (erreur) {
    if (erreur instanceof ErreurHttp) {
      return NextResponse.json(
        {
          message: erreur.message,
          details: erreur.details,
        },
        { status: erreur.codeStatut }
      )
    }

    return NextResponse.json(
      { message: t(ERRORS.ERREUR_INTERNE_SERVEUR) },
      { status: 500 }
    )
  }
}
