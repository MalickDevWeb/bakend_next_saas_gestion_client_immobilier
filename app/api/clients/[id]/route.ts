import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { appliquerEntetesAnnulation } from '@/src/infrastructure/http/appliquerEntetesAnnulation'
import { executerMutationIdempotenteSiDemandee } from '@/src/infrastructure/http/executerMutationIdempotente'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'

type ParametresRoute = { params: Promise<{ id: string }> }

function normaliserTelephone(valeur: unknown): string {
  return String(valeur || '').replace(/\D/g, '')
}

async function obtenirAdminIdScopeClients(
  requete: NextRequest,
  jetonAcces: string
): Promise<string> {
  const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
  const contexteSession =
    await conteneurDependances.serviceAuthentification.obtenirContexteDepuisJetonAcces(jetonAcces)
  const utilisateur = contexteSession.utilisateur
  const role = String(utilisateur.role || '').toUpperCase()

  if (role === 'ADMIN') {
    return String(utilisateur.id || '').trim()
  }

  if (role === 'SUPER_ADMIN' && impersonation?.adminId) {
    await conteneurDependances.serviceAuthentification.exigerSecondeAuthSuperAdmin(jetonAcces)
    return String(impersonation.adminId || '').trim()
  }

  throw new ErreurHttp(CODE_HTTP.INTERDIT, 'Permission manquante.')
}

async function resoudreIdentifiantClient(
  requete: NextRequest,
  jetonAcces: string,
  idBrut: string
): Promise<string> {
  const identifiant = String(idBrut || '').trim()
  if (!identifiant) {
    throw new ErreurHttp(CODE_HTTP.MAUVAISE_REQUETE, 'Identifiant client requis.')
  }

  const adminId = await obtenirAdminIdScopeClients(requete, jetonAcces)
  const identifiantDigits = normaliserTelephone(identifiant)
  const telephones = new Set<string>([identifiant])
  if (identifiantDigits) telephones.add(identifiantDigits)

  const conditions: Prisma.ClientWhereInput[] = [
    { id: identifiant },
    { cni: { equals: identifiant, mode: 'insensitive' } },
    { email: { equals: identifiant, mode: 'insensitive' } },
    ...Array.from(telephones).map((telephone) => ({ telephone })),
  ]

  const correspondances = await conteneurDependances.prisma.client.findMany({
    where: {
      adminId,
      OR: conditions,
    },
    select: { id: true },
    take: 2,
  })

  if (!correspondances.length) {
    throw new ErreurHttp(
      CODE_HTTP.MAUVAISE_REQUETE,
      "Client introuvable. Utilisez id, telephone, email ou cni."
    )
  }

  if (correspondances.length > 1) {
    throw new ErreurHttp(
      CODE_HTTP.MAUVAISE_REQUETE,
      "Plusieurs clients correspondent. Utilisez l'id exact."
    )
  }

  return String(correspondances[0].id).trim()
}

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id: idBrut } = await contexte.params
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const id = await resoudreIdentifiantClient(requete, jetonAcces, idBrut)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const donnees = await conteneurDependances.controleurAdministrationAdmin.obtenirClient(
      jetonAcces,
      impersonation,
      id
    )
    return conteneurDependances.reponseHttp.succes(donnees)
  }
)

const miseAJourClient = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id: idBrut } = await contexte.params
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const id = await resoudreIdentifiantClient(requete, jetonAcces, idBrut)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const corps = (await requete.json().catch(() => ({}))) as Record<string, unknown>

    return executerMutationIdempotenteSiDemandee({
      prisma: conteneurDependances.prisma,
      requete,
      jetonAcces,
      impersonation,
      corps,
      serviceAuthentification: conteneurDependances.serviceAuthentification,
      executerMutation: async () => {
        const resultat = await conteneurDependances.controleurAdministrationAdmin.mettreAJourClient(
          jetonAcces,
          impersonation,
          id,
          corps
        )
        const reponse = conteneurDependances.reponseHttp.succes(resultat.donnees)
        return appliquerEntetesAnnulation(reponse, resultat.annulation)
      },
    })
  }
)

export const PUT = miseAJourClient
export const PATCH = miseAJourClient

export const DELETE = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id: idBrut } = await contexte.params
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const id = await resoudreIdentifiantClient(requete, jetonAcces, idBrut)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)

    return executerMutationIdempotenteSiDemandee({
      prisma: conteneurDependances.prisma,
      requete,
      jetonAcces,
      impersonation,
      corps: {},
      serviceAuthentification: conteneurDependances.serviceAuthentification,
      executerMutation: async () => {
        const resultat = await conteneurDependances.controleurAdministrationAdmin.supprimerClient(
          jetonAcces,
          impersonation,
          id
        )
        const reponse = conteneurDependances.reponseHttp.succes(resultat.donnees)
        return appliquerEntetesAnnulation(reponse, resultat.annulation)
      },
    })
  }
)
