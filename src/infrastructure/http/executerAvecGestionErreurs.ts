import { NextResponse } from 'next/server'
import { ReponseHttp } from '@/src/infrastructure/http/ReponseHttp'

type GestionnaireRoute<TParametres extends unknown[]> =
  (...parametres: TParametres) => Promise<NextResponse> | NextResponse

export function executerAvecGestionErreurs<TParametres extends unknown[]>(
  reponseHttp: ReponseHttp,
  gestionnaire: GestionnaireRoute<TParametres>
): GestionnaireRoute<TParametres> {
  return async (...parametres: TParametres): Promise<NextResponse> => {
    try {
      return await gestionnaire(...parametres)
    } catch (erreur) {
      return reponseHttp.erreur(erreur)
    }
  }
}
