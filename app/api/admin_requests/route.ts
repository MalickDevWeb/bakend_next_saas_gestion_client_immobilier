import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

function extraireChampsAlerteDemandeAdmin(donnees: Record<string, unknown>): Record<string, unknown> {
  return {
    id: donnees.id ?? null,
    name: donnees.name ?? null,
    email: donnees.email ?? null,
    phone: donnees.phone ?? null,
    entrepriseName: donnees.entrepriseName ?? null,
    status: donnees.status ?? null,
    createdAt: donnees.createdAt ?? null,
  }
}

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
 *     parameters:
 *       - in: header
 *         name: x-idempotency-key
 *         required: false
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
 *         description: Origine interdite (CORS)
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
    const corps = (await requete.json().catch(() => ({}))) as Record<string, unknown>
    const donnees = await conteneurDependances.controleurAdministrationAdmin.creerDemandeAdminPublique(
      corps
    )
    void conteneurDependances.serviceAlerteSuperAdminWebhook.envoyer({
      eventType: 'SUPER_ADMIN_ADMIN_REQUEST_CREATED',
      titre: 'Nouvelle demande admin a valider',
      severite: 'warning',
      details: extraireChampsAlerteDemandeAdmin(donnees),
    })

    return conteneurDependances.reponseHttp.succes(donnees)
  }
)
