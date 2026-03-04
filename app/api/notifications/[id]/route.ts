import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { appliquerEntetesAnnulation } from '@/src/infrastructure/http/appliquerEntetesAnnulation'

type ParametresRoute = { params: Promise<{ id: string }> }

export const PATCH = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id } = await contexte.params
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const resultat = await conteneurDependances.controleurAdministrationAdmin.marquerNotificationLue(
      jetonAcces,
      impersonation,
      id
    )
    const reponse = conteneurDependances.reponseHttp.succes(resultat.donnees)
    return appliquerEntetesAnnulation(reponse, resultat.annulation)
  }
)
