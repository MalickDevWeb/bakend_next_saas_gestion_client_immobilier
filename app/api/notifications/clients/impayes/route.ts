import { randomUUID } from 'crypto'
import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'

type TypeRelanceClient = {
  notificationKey: string
  paiementId: string
  locationId: string
  propertyName: string
  dateEcheance: string
  joursRetard: number
  montantDu: number
  montantPaye: number
  montantRestant: number
  adminId: string
  clientId: string
  clientNom: string
  clientTelephone: string
  clientEmail: string | null
}

function convertirNombre(valeur: number | null | undefined): number {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return 0
  return Number(valeur.toFixed(2))
}

function lireBooleenParam(valeur: string | null | undefined, defautValeur = false): boolean {
  if (valeur == null) return defautValeur
  const normalise = String(valeur).trim().toLowerCase()
  if (!normalise) return defautValeur
  return ['1', 'true', 'yes', 'oui'].includes(normalise)
}

function lireEntierParam(
  valeur: string | null | undefined,
  defautValeur: number,
  min: number,
  max: number
): number {
  const nombre = Number(valeur)
  if (!Number.isFinite(nombre)) return defautValeur
  const entier = Math.floor(nombre)
  if (entier < min) return min
  if (entier > max) return max
  return entier
}

function autoriserParSecretCron(requete: NextRequest): boolean {
  const secretConfigure = conteneurDependances.configurationSecurite.cleCronRapportHebdoSuperAdmin()
  if (!secretConfigure) return false
  const secretRecu = String(requete.headers.get('x-cron-secret') || '').trim()
  if (!secretRecu) return false
  return secretRecu === secretConfigure
}

async function exigerSuperAdminAvecSecondeAuth(requete: NextRequest): Promise<void> {
  const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
  const utilisateur = await conteneurDependances.serviceAuthentification.exigerSecondeAuthSuperAdmin(jetonAcces)
  const role = String(utilisateur.role || '').toUpperCase()
  if (role !== 'SUPER_ADMIN') {
    throw new ErreurHttp(CODE_HTTP.INTERDIT, t(ERRORS.AUTH_ACCES_SUPER_ADMIN))
  }
}

async function construireRelancesClients(now: Date, limite: number): Promise<TypeRelanceClient[]> {
  const paiements = await conteneurDependances.prisma.paiementMensuel.findMany({
    where: { dateEcheance: { lt: now } },
    orderBy: { dateEcheance: 'asc' },
    take: limite,
    include: {
      location: {
        select: {
          id: true,
          nomBien: true,
          client: {
            select: {
              id: true,
              adminId: true,
              prenom: true,
              nom: true,
              telephone: true,
              email: true,
            },
          },
        },
      },
    },
  })

  const jourReference = now.toISOString().slice(0, 10)

  return paiements
    .filter((paiement) => convertirNombre(paiement.montantPaye) < convertirNombre(paiement.montantDu))
    .map((paiement) => {
      const montantDu = convertirNombre(paiement.montantDu)
      const montantPaye = convertirNombre(paiement.montantPaye)
      const montantRestant = convertirNombre(Math.max(0, montantDu - montantPaye))
      const client = paiement.location.client
      const clientNom = `${String(client.prenom || '').trim()} ${String(client.nom || '').trim()}`.trim()
      const joursRetard = Math.max(
        1,
        Math.floor((now.getTime() - paiement.dateEcheance.getTime()) / (24 * 60 * 60 * 1000))
      )

      return {
        notificationKey: `OVERDUE_REMINDER:${paiement.id}:${jourReference}`,
        paiementId: paiement.id,
        locationId: paiement.location.id,
        propertyName: String(paiement.location.nomBien || '').trim() || '-',
        dateEcheance: paiement.dateEcheance.toISOString(),
        joursRetard,
        montantDu,
        montantPaye,
        montantRestant,
        adminId: client.adminId,
        clientId: client.id,
        clientNom: clientNom || client.telephone,
        clientTelephone: client.telephone,
        clientEmail: client.email || null,
      }
    })
}

function construireResumeAdmin(relances: TypeRelanceClient[]): Array<Record<string, unknown>> {
  const parAdmin = new Map<string, { total: number; montantRestantTotal: number; clients: Set<string> }>()

  for (const relance of relances) {
    const item = parAdmin.get(relance.adminId) || {
      total: 0,
      montantRestantTotal: 0,
      clients: new Set<string>(),
    }
    item.total += 1
    item.montantRestantTotal += relance.montantRestant
    item.clients.add(relance.clientId)
    parAdmin.set(relance.adminId, item)
  }

  return Array.from(parAdmin.entries()).map(([adminId, item]) => ({
    adminId,
    totalRelances: item.total,
    totalClientsImpactes: item.clients.size,
    montantRestantTotal: convertirNombre(item.montantRestantTotal),
  }))
}

/**
 * @swagger
 * /api/notifications/clients/impayes:
 *   get:
 *     summary: Genere les relances clients impayes (retard loyer) + resume ADMIN
 *     tags:
 *       - Administration Admin
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-cron-secret
 *         required: false
 *         schema:
 *           type: string
 *         description: Secret cron optionnel pour execution automatique sans cookie/session.
 *       - in: query
 *         name: dryRun
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: true = calcule sans envoyer ni persister.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *           default: 200
 *       - in: query
 *         name: force
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: true = ignore anti-doublon quotidien.
 *     responses:
 *       200:
 *         description: Relances calculees, et envoyees si dryRun=false
 *       403:
 *         description: Reserve SUPER_ADMIN (hors mode cron secret)
 */
export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const autoriseCron = autoriserParSecretCron(requete)
    if (!autoriseCron) {
      await exigerSuperAdminAvecSecondeAuth(requete)
    }

    const dryRun = lireBooleenParam(requete.nextUrl.searchParams.get('dryRun'), false)
    const force = lireBooleenParam(requete.nextUrl.searchParams.get('force'), false)
    const limite = lireEntierParam(requete.nextUrl.searchParams.get('limit'), 200, 1, 500)
    const maintenant = new Date()

    const relancesBrutes = await construireRelancesClients(maintenant, limite)

    let relances = relancesBrutes
    if (!force && relancesBrutes.length > 0) {
      const clefs = relancesBrutes.map((item) => item.notificationKey)
      const existantes = await conteneurDependances.prisma.notification.findMany({
        where: {
          type: 'CLIENT_OVERDUE_REMINDER',
          message: { in: clefs },
        },
        select: { message: true },
      })
      const dejaEnvoyees = new Set(existantes.map((item) => item.message))
      relances = relancesBrutes.filter((item) => !dejaEnvoyees.has(item.notificationKey))
    }

    const resumeAdmin = construireResumeAdmin(relances)

    if (dryRun || relances.length === 0) {
      return conteneurDependances.reponseHttp.succes({
        acteurCible: 'CLIENT',
        modeExecution: autoriseCron ? 'CRON_SECRET' : 'AUTH_SUPER_ADMIN',
        dryRun,
        webhookConfigure: conteneurDependances.serviceAlerteSuperAdminWebhook.estConfigure(),
        totalRelances: relances.length,
        totalRelancesBrutes: relancesBrutes.length,
        totalAdminsImpactes: resumeAdmin.length,
        relances: relances.slice(0, 50),
        resumeAdmin,
      })
    }

    if (!conteneurDependances.serviceAlerteSuperAdminWebhook.estConfigure()) {
      throw new ErreurHttp(
        CODE_HTTP.SERVICE_INDISPONIBLE,
        'Webhook non configure pour les relances clients impayes'
      )
    }

    const webhookClientEnvoye = await conteneurDependances.serviceAlerteSuperAdminWebhook.envoyer({
      acteurCible: 'CLIENT',
      eventType: 'CLIENT_OVERDUE_PAYMENT_REMINDER',
      titre: 'Relances clients en retard de paiement',
      severite: 'warning',
      details: {
        totalRelances: relances.length,
        relances,
      },
    })

    const webhookAdminEnvoye = await conteneurDependances.serviceAlerteSuperAdminWebhook.envoyer({
      acteurCible: 'ADMIN',
      eventType: 'ADMIN_CLIENT_OVERDUE_SUMMARY',
      titre: 'Resume admin des retards clients',
      severite: 'warning',
      details: {
        totalRelances: relances.length,
        totalAdminsImpactes: resumeAdmin.length,
        resumeAdmin,
      },
    })

    if (!webhookClientEnvoye || !webhookAdminEnvoye) {
      throw new ErreurHttp(
        CODE_HTTP.ERREUR_INTERNE,
        'Echec envoi webhook des relances clients impayes'
      )
    }

    await conteneurDependances.prisma.notification.createMany({
      data: relances.map((item) => ({
        id: randomUUID(),
        utilisateurId: `client:${item.clientId}`,
        message: item.notificationKey,
        type: 'CLIENT_OVERDUE_REMINDER',
        estLue: false,
      })),
    })

    return conteneurDependances.reponseHttp.succes({
      acteurCible: 'CLIENT',
      modeExecution: autoriseCron ? 'CRON_SECRET' : 'AUTH_SUPER_ADMIN',
      dryRun: false,
      webhookConfigure: true,
      webhookClientEnvoye,
      webhookAdminEnvoye,
      totalRelances: relances.length,
      totalAdminsImpactes: resumeAdmin.length,
      resumeAdmin,
    })
  }
)
