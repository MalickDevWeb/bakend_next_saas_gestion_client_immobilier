import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { appliquerEntetesAnnulation } from '@/src/infrastructure/http/appliquerEntetesAnnulation'

type ParametresRoute = { params: Promise<{ id: string }> }

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id } = await contexte.params
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const donnees = await conteneurDependances.controleurAdministrationAdmin.obtenirImport(
      jetonAcces,
      impersonation,
      id
    )
    return conteneurDependances.reponseHttp.succes(donnees)
  }
)

const miseAJourImport = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id } = await contexte.params
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const corps = (await requete.json().catch(() => ({}))) as Record<string, unknown>
    const resultat = await conteneurDependances.controleurAdministrationAdmin.mettreAJourImport(
      jetonAcces,
      impersonation,
      id,
      corps
    )
    const reponse = conteneurDependances.reponseHttp.succes(resultat.donnees)
    return appliquerEntetesAnnulation(reponse, resultat.annulation)
  }
)

export const PUT = miseAJourImport
export const PATCH = miseAJourImport
