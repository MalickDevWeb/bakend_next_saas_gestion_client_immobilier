import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const corps = (await requete.json().catch(() => ({}))) as Record<string, unknown>
    const identifiant = String(
      corps.identifiant ||
        corps.username ||
        corps.telephone ||
        corps.numero ||
        corps.email ||
        ''
    ).trim()
    const motDePasse = String(corps.motDePasse || corps.password || '').trim()

    if (!identifiant || !motDePasse) {
      return conteneurDependances.reponseHttp.succes({ pending: false })
    }

    const pending =
      await conteneurDependances.serviceAdministrationAdminSupervision.verifierDemandeAdminEnAttente(
        identifiant,
        motDePasse
      )

    return conteneurDependances.reponseHttp.succes({ pending })
  }
)
