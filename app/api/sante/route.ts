import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

const etatAlerteSante = {
  derniereAlerteMs: 0,
  derniereSignature: '',
}

function estEtatSanteKo(resultat: Record<string, unknown>): boolean {
  const statut = String(resultat.statut || '').toLowerCase()
  const baseDeDonnees = String(resultat.baseDeDonnees || '').toLowerCase()
  return statut !== 'ok' || baseDeDonnees === 'indisponible' || baseDeDonnees === 'down'
}

function signatureEtatSante(resultat: Record<string, unknown>): string {
  return `${String(resultat.statut || '')}::${String(resultat.baseDeDonnees || '')}`
}

/**
 * @swagger
 * /api/sante:
 *   get:
 *     summary: Verifie l'etat du serveur
 *     parameters:
 *       - in: query
 *         name: verbeux
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Inclut des informations supplementaires
 *     responses:
 *       200:
 *         description: Serveur operationnel
 */
export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const verbeux = requete.nextUrl.searchParams.get('verbeux') ?? undefined
    const resultat = await conteneurDependances.controleurSante.traiterRequete({ verbeux }) as Record<string, unknown>

    if (estEtatSanteKo(resultat)) {
      const maintenant = Date.now()
      const cooldownMs =
        conteneurDependances.configurationSecurite.cooldownAlerteSanteSuperAdminMillisecondes()
      const signature = signatureEtatSante(resultat)
      const cooldownDepasse = maintenant - etatAlerteSante.derniereAlerteMs >= cooldownMs
      const etatChange = signature !== etatAlerteSante.derniereSignature
      if (cooldownDepasse || etatChange) {
        etatAlerteSante.derniereAlerteMs = maintenant
        etatAlerteSante.derniereSignature = signature
        void conteneurDependances.serviceAlerteSuperAdminWebhook.envoyer({
          eventType: 'SUPER_ADMIN_BACKEND_HEALTH_DOWN',
          titre: 'Alerte indisponibilite backend (/api/sante)',
          severite: 'critical',
          details: {
            endpoint: '/api/sante',
            origin: requete.nextUrl.origin,
            statut: resultat.statut ?? null,
            baseDeDonnees: resultat.baseDeDonnees ?? null,
            uptime: resultat.uptime ?? null,
          },
        })
      }
    }

    return conteneurDependances.reponseHttp.succes(resultat)
  }
)
