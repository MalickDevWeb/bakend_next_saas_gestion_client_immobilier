import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const donnees = await conteneurDependances.controleurAdministrationAdmin.obtenirStatutPaiementAdmin(
      jetonAcces,
      impersonation,
      new URL(requete.url)
    )
    return conteneurDependances.reponseHttp.succes(donnees)
  }
)
