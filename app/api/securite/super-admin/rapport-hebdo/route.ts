import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'

function convertirNombre(valeur: number | null | undefined): number {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return 0
  return Number(valeur.toFixed(2))
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

async function construireRapportHebdoGlobal() {
  const maintenant = new Date()
  const debutPeriode = new Date(maintenant.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    adminsTotal,
    adminsActifs,
    adminsEnAttente,
    adminsSuspendus,
    adminsBlackliste,
    clientsTotal,
    nouveauxClients7j,
    paiementsLoyerTotal,
    paiementsLoyerRegles,
    sommePaiementsLoyer,
    transactionsTotal,
    transactions7j,
    sommeTransactions7j,
    paiementsAbonnementTotal,
    paiementsAbonnementPayes,
    sommePaiementsAbonnement,
    paiementsAbonnement7j,
    sommePaiementsAbonnement7j,
  ] = await Promise.all([
    conteneurDependances.prisma.admin.count(),
    conteneurDependances.prisma.admin.count({ where: { statut: 'ACTIF' } }),
    conteneurDependances.prisma.admin.count({ where: { statut: 'EN_ATTENTE' } }),
    conteneurDependances.prisma.admin.count({ where: { statut: 'SUSPENDU' } }),
    conteneurDependances.prisma.admin.count({ where: { statut: 'BLACKLISTE' } }),
    conteneurDependances.prisma.client.count(),
    conteneurDependances.prisma.client.count({ where: { creeLe: { gte: debutPeriode } } }),
    conteneurDependances.prisma.paiementMensuel.count(),
    conteneurDependances.prisma.paiementMensuel.count({ where: { montantPaye: { gt: 0 } } }),
    conteneurDependances.prisma.paiementMensuel.aggregate({ _sum: { montantPaye: true } }),
    conteneurDependances.prisma.transactionPaiement.count(),
    conteneurDependances.prisma.transactionPaiement.count({
      where: { datePaiement: { gte: debutPeriode } },
    }),
    conteneurDependances.prisma.transactionPaiement.aggregate({
      where: { datePaiement: { gte: debutPeriode } },
      _sum: { montant: true },
    }),
    conteneurDependances.prisma.paiementAbonnementAdmin.count(),
    conteneurDependances.prisma.paiementAbonnementAdmin.count({
      where: { OR: [{ statut: 'paid' }, { payeLe: { not: null } }] },
    }),
    conteneurDependances.prisma.paiementAbonnementAdmin.aggregate({
      where: { OR: [{ statut: 'paid' }, { payeLe: { not: null } }] },
      _sum: { montant: true },
    }),
    conteneurDependances.prisma.paiementAbonnementAdmin.count({
      where: {
        OR: [
          { payeLe: { gte: debutPeriode } },
          { AND: [{ payeLe: null }, { creeLe: { gte: debutPeriode } }] },
        ],
      },
    }),
    conteneurDependances.prisma.paiementAbonnementAdmin.aggregate({
      where: {
        OR: [
          { payeLe: { gte: debutPeriode } },
          { AND: [{ payeLe: null }, { creeLe: { gte: debutPeriode } }] },
        ],
      },
      _sum: { montant: true },
    }),
  ])

  return {
    periode: {
      debut: debutPeriode.toISOString(),
      fin: maintenant.toISOString(),
    },
    admins: {
      total: adminsTotal,
      actifs: adminsActifs,
      enAttente: adminsEnAttente,
      suspendus: adminsSuspendus,
      blackliste: adminsBlackliste,
    },
    clients: {
      total: clientsTotal,
      nouveaux7j: nouveauxClients7j,
    },
    paiements: {
      loyers: {
        total: paiementsLoyerTotal,
        regles: paiementsLoyerRegles,
        montantRegleTotal: convertirNombre(sommePaiementsLoyer._sum.montantPaye),
      },
      transactions: {
        total: transactionsTotal,
        total7j: transactions7j,
        montant7j: convertirNombre(sommeTransactions7j._sum.montant),
      },
      abonnementsAdmin: {
        total: paiementsAbonnementTotal,
        payes: paiementsAbonnementPayes,
        montantPayeTotal: convertirNombre(sommePaiementsAbonnement._sum.montant),
        total7j: paiementsAbonnement7j,
        montant7j: convertirNombre(sommePaiementsAbonnement7j._sum.montant),
      },
    },
  }
}

/**
 * @swagger
 * /api/securite/super-admin/rapport-hebdo:
 *   get:
 *     summary: Genere et envoie le rapport hebdo global au SUPER_ADMIN
 *     tags:
 *       - Securite
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
 *         name: envoyer
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *         description: false = genere sans envoyer au webhook.
 *     responses:
 *       200:
 *         description: Rapport genere (et alerte envoyee si activee)
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse (super admin requis)
 */
export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const autoriseCron = autoriserParSecretCron(requete)
    if (!autoriseCron) {
      await exigerSuperAdminAvecSecondeAuth(requete)
    }

    const rapport = await construireRapportHebdoGlobal()
    const envoyer = String(requete.nextUrl.searchParams.get('envoyer') || 'true').toLowerCase() !== 'false'

    let alerteEnvoyee = false
    if (envoyer) {
      alerteEnvoyee = await conteneurDependances.serviceAlerteSuperAdminWebhook.envoyer({
        eventType: 'SUPER_ADMIN_WEEKLY_GLOBAL_REPORT',
        titre: 'Rapport hebdomadaire global',
        severite: 'info',
        details: rapport,
      })
      if (!alerteEnvoyee && conteneurDependances.serviceAlerteSuperAdminWebhook.estConfigure()) {
        throw new ErreurHttp(
          CODE_HTTP.ERREUR_INTERNE,
          'Rapport genere mais envoi webhook super admin en echec'
        )
      }
    }

    return conteneurDependances.reponseHttp.succes({
      acteurCible: 'SUPER_ADMIN',
      modeExecution: autoriseCron ? 'CRON_SECRET' : 'AUTH_SUPER_ADMIN',
      webhookConfigure: conteneurDependances.serviceAlerteSuperAdminWebhook.estConfigure(),
      alerteEnvoyee,
      rapport,
    })
  }
)
