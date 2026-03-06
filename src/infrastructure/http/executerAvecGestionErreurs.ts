import { NextRequest, NextResponse } from 'next/server'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { ReponseHttp } from '@/src/infrastructure/http/ReponseHttp'
import { ClientPrisma } from '@/src/infrastructure/base_de_donnees/ClientPrisma'
import { envoyerAlerteConformiteDepuisPolitique } from '@/src/infrastructure/http/politiquePlateforme'

type GestionnaireRoute<TParametres extends unknown[]> =
  (...parametres: TParametres) => Promise<NextResponse> | NextResponse

const prisma = ClientPrisma.obtenirInstance()

export function executerAvecGestionErreurs<TParametres extends unknown[]>(
  reponseHttp: ReponseHttp,
  gestionnaire: GestionnaireRoute<TParametres>
): GestionnaireRoute<TParametres> {
  return async (...parametres: TParametres): Promise<NextResponse> => {
    try {
      return await gestionnaire(...parametres)
    } catch (erreur) {
      const requete = parametres.find((parametre) => parametre instanceof NextRequest) as
        | NextRequest
        | undefined
      const codeStatut = erreur instanceof ErreurHttp ? erreur.codeStatut : 500

      if (codeStatut >= 500 && requete) {
        const url = new URL(requete.url)
        void envoyerAlerteConformiteDepuisPolitique({
          prisma,
          type: 'api_error',
          evenement: 'api_error',
          payload: {
            path: url.pathname,
            method: String(requete.method || 'GET').toUpperCase(),
            status: codeStatut,
            error: erreur instanceof Error ? erreur.message : String(erreur || 'Unknown error'),
          },
        })
      }

      return reponseHttp.erreur(erreur)
    }
  }
}
