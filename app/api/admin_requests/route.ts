import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { appliquerEntetesAnnulation } from '@/src/infrastructure/http/appliquerEntetesAnnulation'
import { executerMutationIdempotenteSiDemandee } from '@/src/infrastructure/http/executerMutationIdempotente'

/**
 * @swagger
 * /api/admin_requests:
 *   get:
 *     summary: Liste les demandes d admin
 *     tags:
 *       - Administration Admin
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes admin
 *       403:
 *         description: Acces refuse (role/portee)
 *   post:
 *     summary: Cree une demande d admin
 *     tags:
 *       - Administration Admin
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
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
 *         description: Demande admin creee
 *       400:
 *         description: Parametres invalides
 *       403:
 *         description: Acces refuse (role/portee/CSRF)
 */
export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const donnees =
      await conteneurDependances.controleurAdministrationAdmin.listerDemandesAdmin(
        jetonAcces,
        impersonation,
        new URL(requete.url)
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

    return executerMutationIdempotenteSiDemandee({
      prisma: conteneurDependances.prisma,
      requete,
      jetonAcces,
      impersonation,
      corps,
      serviceAuthentification: conteneurDependances.serviceAuthentification,
      executerMutation: async () => {
        const resultat = await conteneurDependances.controleurAdministrationAdmin.creerDemandeAdmin(
          jetonAcces,
          impersonation,
          corps
        )
        const reponse = conteneurDependances.reponseHttp.succes(resultat.donnees)
        return appliquerEntetesAnnulation(reponse, resultat.annulation)
      },
    })
  }
)
