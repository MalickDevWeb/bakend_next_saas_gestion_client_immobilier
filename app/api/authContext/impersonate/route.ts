import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'

type TypeLigneAdmin = {
  id?: unknown
  userId?: unknown
  name?: unknown
  username?: unknown
  email?: unknown
}

function normaliserTexte(valeur: unknown): string {
  return String(valeur || '').trim().toLowerCase()
}

function normaliserTelephone(valeur: unknown): string {
  return String(valeur || '').replace(/\D/g, '')
}

async function resoudreCibleImpersonation(
  requete: NextRequest,
  jetonAcces: string,
  corps: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const adminIdBrut = String(corps.adminId || '').trim()
  const adminNameBrut = String(corps.adminName || '').trim()
  const identifiantBrut = String(
    corps.identifiant || corps.telephone || corps.username || corps.email || ''
  ).trim()

  // Cas nominal deja complet.
  if (adminIdBrut && adminNameBrut) return corps

  if (!adminIdBrut && !identifiantBrut) return corps

  const adminsBruts = await conteneurDependances.controleurAdministrationAdmin.listerAdmins(
    jetonAcces,
    null,
    new URL(requete.url)
  )
  const admins = adminsBruts as TypeLigneAdmin[]
  const identifiantNormalise = normaliserTexte(identifiantBrut)
  const identifiantDigits = normaliserTelephone(identifiantBrut)

  let cibles: TypeLigneAdmin[] = []

  if (adminIdBrut) {
    cibles = admins.filter((admin) => String(admin.id || '').trim() === adminIdBrut)
  } else {
    cibles = admins.filter((admin) => {
      const username = String(admin.username || '').trim()
      const email = String(admin.email || '').trim()
      const usernameDigits = normaliserTelephone(username)
      return (
        normaliserTexte(username) === identifiantNormalise ||
        normaliserTexte(email) === identifiantNormalise ||
        (Boolean(identifiantDigits) && usernameDigits === identifiantDigits)
      )
    })
  }

  if (!cibles.length) {
    throw new ErreurHttp(
      CODE_HTTP.MAUVAISE_REQUETE,
      "Admin cible introuvable. Utilisez adminId/adminName ou un identifiant admin valide (telephone/email/username)."
    )
  }
  if (cibles.length > 1) {
    throw new ErreurHttp(
      CODE_HTTP.MAUVAISE_REQUETE,
      "Plusieurs admins correspondent a cet identifiant. Fournissez adminId et adminName."
    )
  }
  const cible = cibles[0]
  const userIdCible = String(cible.userId || '').trim()
  const adminIdCible = userIdCible || String(cible.id || '').trim()

  return {
    ...corps,
    adminId: adminIdCible || adminIdBrut,
    adminName: String(corps.adminName || cible.name || cible.username || identifiantBrut).trim(),
    userId: String(corps.userId || userIdCible || '').trim() || null,
  }
}

/**
 * @swagger
 * /api/authContext/impersonate:
 *   post:
 *     summary: Active l impersonation d un ADMIN par un SUPER_ADMIN
 *     description: >
 *       Endpoint reserve exclusivement au role SUPER_ADMIN.
 *       La cible doit etre un compte ADMIN actif existant.
 *       Le serveur ecrit le cookie `kya_impersonation` utilise ensuite par les endpoints admin scopees (`/api/clients`, `/api/locations`, etc.).
 *     tags:
 *       - Authentification
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
 *         description: Double submit token, doit correspondre au cookie kya_csrf_token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adminId, adminName]
 *             properties:
 *               adminId:
 *                 type: string
 *               adminName:
 *                 type: string
 *               identifiant:
 *                 type: string
 *                 description: Alias pratique (telephone, username ou email) pour resoudre automatiquement adminId/adminName.
 *               telephone:
 *                 type: string
 *                 description: Alias pratique de identifiant.
 *               username:
 *                 type: string
 *                 description: Alias pratique de identifiant.
 *               email:
 *                 type: string
 *                 description: Alias pratique de identifiant.
 *               userId:
 *                 type: string
 *                 nullable: true
 *           examples:
 *             format_complet:
 *               summary: Format historique
 *               value:
 *                 adminId: "cmxxxxxxxxxxxxxxxxxxxxxxx"
 *                 adminName: "Admin KYA"
 *             format_identifiant:
 *               summary: Format simplifie par numero/email/username
 *               value:
 *                 telephone: "771234568"
 *     responses:
 *       200:
 *         description: Impersonation activee
 *       400:
 *         description: Cible admin invalide (inexistante, inactive ou role non ADMIN)
 *       403:
 *         description: Reserve au Super Admin ou CSRF/origine invalide
 */
export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const corpsBrut = (await requete.json().catch(() => ({}))) as Record<string, unknown>
    const corps = await resoudreCibleImpersonation(requete, jetonAcces, corpsBrut)

    const impersonation = await conteneurDependances.controleurAuthContext.definirImpersonation(
      jetonAcces,
      corps
    )

    const reponse = conteneurDependances.reponseHttp.succes({
      ok: true,
      impersonation,
    })
    conteneurDependances.serviceCookiesAuthentification.ecrireCookieImpersonation(
      reponse,
      impersonation,
      conteneurDependances.configurationSecurite.dureeJetonRefreshSecondes()
    )
    return reponse
  }
)
