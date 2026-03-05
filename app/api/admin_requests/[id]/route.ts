import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { appliquerEntetesAnnulation } from '@/src/infrastructure/http/appliquerEntetesAnnulation'
import { executerMutationIdempotenteSiDemandee } from '@/src/infrastructure/http/executerMutationIdempotente'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'

type ParametresRoute = { params: Promise<{ id: string }> }
type TypeLigneDemandeAdmin = {
  id?: unknown
  email?: unknown
  phone?: unknown
  username?: unknown
}

function normaliserTexte(valeur: unknown): string {
  return String(valeur || '').trim().toLowerCase()
}

function normaliserTelephone(valeur: unknown): string {
  return String(valeur || '').replace(/\D/g, '')
}

async function resoudreIdentifiantDemandeAdmin(
  requete: NextRequest,
  jetonAcces: string,
  idBrut: string
): Promise<string> {
  const identifiant = String(idBrut || '').trim()
  if (!identifiant) {
    throw new ErreurHttp(CODE_HTTP.MAUVAISE_REQUETE, 'Identifiant de demande admin requis.')
  }

  const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
  const demandesBrutes =
    await conteneurDependances.controleurAdministrationAdmin.listerDemandesAdmin(
      jetonAcces,
      impersonation,
      new URL(requete.url)
    )
  const demandes = demandesBrutes as TypeLigneDemandeAdmin[]

  const identifiantNormalise = normaliserTexte(identifiant)
  const identifiantDigits = normaliserTelephone(identifiant)
  const correspondances = demandes.filter((demande) => {
    const id = String(demande.id || '').trim()
    const email = normaliserTexte(demande.email)
    const username = normaliserTexte(demande.username)
    const phoneDigits = normaliserTelephone(demande.phone)

    return (
      id === identifiant ||
      email === identifiantNormalise ||
      username === identifiantNormalise ||
      (Boolean(identifiantDigits) && phoneDigits === identifiantDigits)
    )
  })

  if (!correspondances.length) {
    throw new ErreurHttp(
      CODE_HTTP.MAUVAISE_REQUETE,
      "Demande admin introuvable. Utilisez id, telephone, email ou username."
    )
  }

  if (correspondances.length > 1) {
    throw new ErreurHttp(
      CODE_HTTP.MAUVAISE_REQUETE,
      "Plusieurs demandes correspondent. Utilisez l'id exact."
    )
  }

  return String(correspondances[0].id || '').trim()
}

/**
 * @swagger
 * /api/admin_requests/{id}:
 *   get:
 *     summary: Recupere une demande d admin
 *     tags:
 *       - Administration Admin
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de demande admin, ou alias (telephone/email/username) pour resolution automatique.
 *     responses:
 *       200:
 *         description: Demande admin trouvee
 *       404:
 *         description: Demande admin introuvable
 *   put:
 *     summary: Met a jour une demande d admin
 *     tags:
 *       - Administration Admin
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de demande admin, ou alias (telephone/email/username) pour resolution automatique.
 *       - in: header
 *         name: x-csrf-token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Demande admin mise a jour
 *       404:
 *         description: Demande admin introuvable
 *   patch:
 *     summary: Met a jour partiellement une demande d admin
 *     tags:
 *       - Administration Admin
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de demande admin, ou alias (telephone/email/username) pour resolution automatique.
 *       - in: header
 *         name: x-csrf-token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Demande admin mise a jour
 *       404:
 *         description: Demande admin introuvable
 *   delete:
 *     summary: Supprime une demande d admin
 *     tags:
 *       - Administration Admin
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de demande admin, ou alias (telephone/email/username) pour resolution automatique.
 *       - in: header
 *         name: x-csrf-token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Demande admin supprimee
 *       404:
 *         description: Demande admin introuvable
 */
export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id: idBrut } = await contexte.params
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const id = await resoudreIdentifiantDemandeAdmin(requete, jetonAcces, idBrut)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const donnees = await conteneurDependances.controleurAdministrationAdmin.obtenirDemandeAdmin(
      jetonAcces,
      impersonation,
      id
    )
    return conteneurDependances.reponseHttp.succes(donnees)
  }
)

const miseAJourDemandeAdmin = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id: idBrut } = await contexte.params
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const id = await resoudreIdentifiantDemandeAdmin(requete, jetonAcces, idBrut)
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
        const resultat =
          await conteneurDependances.controleurAdministrationAdmin.mettreAJourDemandeAdmin(
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

export const PUT = miseAJourDemandeAdmin
export const PATCH = miseAJourDemandeAdmin

export const DELETE = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest, contexte: ParametresRoute) => {
    const { id: idBrut } = await contexte.params
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const id = await resoudreIdentifiantDemandeAdmin(requete, jetonAcces, idBrut)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)

    return executerMutationIdempotenteSiDemandee({
      prisma: conteneurDependances.prisma,
      requete,
      jetonAcces,
      impersonation,
      corps: {},
      serviceAuthentification: conteneurDependances.serviceAuthentification,
      executerMutation: async () => {
        const resultat = await conteneurDependances.controleurAdministrationAdmin.supprimerDemandeAdmin(
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
