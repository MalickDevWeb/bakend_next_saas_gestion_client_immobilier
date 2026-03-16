import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { appliquerEntetesAnnulation } from '@/src/infrastructure/http/appliquerEntetesAnnulation'
import { executerMutationIdempotenteSiDemandee } from '@/src/infrastructure/http/executerMutationIdempotente'

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const url = new URL(requete.url)
    const clientId = url.searchParams.get('clientId') || undefined
    const donnees = await conteneurDependances.controleurAdministrationAdmin.listerContracts(
      jetonAcces,
      impersonation,
      clientId
    )
    return conteneurDependances.reponseHttp.succes(donnees)
  }
)

export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const corps = (await requete.json().catch(() => ({}))) as Record<string, unknown>
    const clientId = String((corps.clientId as string) || '').trim()

    return executerMutationIdempotenteSiDemandee({
      prisma: conteneurDependances.prisma,
      requete,
      jetonAcces,
      impersonation,
      corps,
      serviceAuthentification: conteneurDependances.serviceAuthentification,
      executerMutation: async () => {
        const resultat = await conteneurDependances.controleurAdministrationAdmin.genererContract(
          jetonAcces,
          impersonation,
          clientId,
          {
            templateId: corps.templateId as string | null,
            locationId: (corps.locationId as string) || null,
            donnees: (corps.donnees as Record<string, unknown>) || {},
          }
        )
        const reponse = conteneurDependances.reponseHttp.succes(resultat)
        return appliquerEntetesAnnulation(reponse, undefined)
      },
    })
  }
)

export const PUT = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const corps = (await requete.json().catch(() => ({}))) as Record<string, unknown>
    const id = String((corps.id as string) || '').trim()
    const signatures = (corps.signatures as Record<string, unknown>) || {}
    const resultat = await conteneurDependances.controleurAdministrationAdmin.signerContract(
      jetonAcces,
      impersonation,
      id,
      signatures
    )
    return conteneurDependances.reponseHttp.succes(resultat)
  }
)
