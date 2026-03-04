import { PrismaClient } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import {
  DonneesAuditSecurite,
  DonneesJetonRefreshAuthentification,
  DonneesSessionAuthentification,
  DonneesTentativeConnexion,
  DonneesUtilisateurAuthentification,
  EntreeCreationSessionAuthentification,
  EntreeRotationJetonRefresh,
  EntreeTentativeConnexion,
  InterfaceDaoAuthentification,
} from '@/src/domaine/interfaces/dao/authentification/InterfaceDaoAuthentification'
import { TypeTentativeConnexionAuthentification } from '@/src/domaine/types/authentification/TypeTentativeConnexionAuthentification'

export class DaoAuthentificationPrisma implements InterfaceDaoAuthentification {
  constructor(private readonly prisma: PrismaClient) {}

  public async rechercherUtilisateurParTelephoneOuEmail(
    identifiant: string
  ): Promise<DonneesUtilisateurAuthentification | null> {
    const identifiantNormalise = String(identifiant || '').trim()
    const utilisateur = await this.prisma.utilisateur.findFirst({
      where: {
        OR: [{ telephone: identifiantNormalise }, { email: identifiantNormalise }],
      },
      include: {
        permissions: {
          where: { autorise: true },
        },
      },
    })

    if (!utilisateur) return null
    return this.mapperUtilisateur(utilisateur)
  }

  public async creerSessionEtJetonRefresh(
    entree: EntreeCreationSessionAuthentification
  ): Promise<void> {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.sessionAuthentification.create({
        data: {
          id: entree.sessionId,
          utilisateurId: entree.utilisateurId,
          jetonAccesJti: entree.jetonAccesJti,
          jetonAccesExpireLe: entree.jetonAccesExpireLe,
          csrfToken: entree.csrfToken,
          adresseIp: entree.adresseIp,
          agentUtilisateur: entree.agentUtilisateur,
          expireLe: entree.expireLeSession,
        },
      })

      await tx.jetonRefresh.create({
        data: {
          sessionId: entree.sessionId,
          hachageToken: entree.hachageJetonRefresh,
          expireLe: entree.expireLeRefresh,
        },
      })
    })
  }

  public async rechercherSessionParIdAvecUtilisateur(
    sessionId: string
  ): Promise<DonneesSessionAuthentification | null> {
    const session = await this.prisma.sessionAuthentification.findUnique({
      where: { id: sessionId },
      include: {
        utilisateur: {
          include: {
            permissions: {
              where: { autorise: true },
            },
          },
        },
      },
    })

    if (!session?.utilisateur) return null
    return this.mapperSession(session)
  }

  public async rechercherJetonRefreshParHachageAvecSession(
    hachageToken: string
  ): Promise<DonneesJetonRefreshAuthentification | null> {
    const jeton = await this.prisma.jetonRefresh.findUnique({
      where: { hachageToken },
      include: {
        session: {
          include: {
            utilisateur: {
              include: {
                permissions: {
                  where: { autorise: true },
                },
              },
            },
          },
        },
      },
    })

    if (!jeton?.session?.utilisateur) return null
    return this.mapperJetonRefresh(jeton)
  }

  public async revoquerJetonRefreshParId(
    jetonRefreshId: string,
    dateRevocation: Date
  ): Promise<void> {
    await this.prisma.jetonRefresh.update({
      where: { id: jetonRefreshId },
      data: { revoqueLe: dateRevocation },
    })
  }

  public async effectuerRotationJetonRefresh(entree: EntreeRotationJetonRefresh): Promise<void> {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const nouveauJeton = await tx.jetonRefresh.create({
        data: {
          sessionId: entree.sessionId,
          hachageToken: entree.hachageNouveauJetonRefresh,
          expireLe: entree.expireLeRefresh,
        },
      })

      await tx.jetonRefresh.update({
        where: { id: entree.jetonRefreshActuelId },
        data: {
          utiliseLe: entree.dateRotation,
          revoqueLe: entree.dateRotation,
          remplaceParId: nouveauJeton.id,
        },
      })

      await tx.sessionAuthentification.update({
        where: { id: entree.sessionId },
        data: {
          jetonAccesJti: entree.nouveauJtiJetonAcces,
          jetonAccesExpireLe: entree.expireLeJetonAcces,
          csrfToken: entree.nouveauCsrfToken,
          adresseIp: entree.adresseIp,
          agentUtilisateur: entree.agentUtilisateur,
          misAJourLe: entree.dateRotation,
        },
      })
    })
  }

  public async revoquerSessionEtJetonsRefresh(
    sessionId: string,
    dateRevocation: Date
  ): Promise<void> {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.sessionAuthentification.updateMany({
        where: {
          id: sessionId,
          revoqueeLe: null,
        },
        data: {
          revoqueeLe: dateRevocation,
        },
      })

      await tx.jetonRefresh.updateMany({
        where: {
          sessionId,
          revoqueLe: null,
        },
        data: {
          revoqueLe: dateRevocation,
        },
      })
    })
  }

  public async activerTotpSuperAdmin(utilisateurId: string, secretChiffre: string): Promise<void> {
    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        superAdminTotpActive: true,
        superAdminTotpSecret: secretChiffre,
      },
    })
  }

  public async rechercherTotpSuperAdmin(utilisateurId: string): Promise<{
    id: string
    superAdminTotpActive: boolean
    superAdminTotpSecret: string | null
  } | null> {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: {
        id: true,
        superAdminTotpActive: true,
        superAdminTotpSecret: true,
      },
    })

    if (!utilisateur) return null
    return {
      id: utilisateur.id,
      superAdminTotpActive: utilisateur.superAdminTotpActive,
      superAdminTotpSecret: utilisateur.superAdminTotpSecret,
    }
  }

  public async definirSecondeAuthSession(sessionId: string, dateValidation: Date): Promise<void> {
    await this.prisma.sessionAuthentification.update({
      where: { id: sessionId },
      data: {
        secondeAuthValideeLe: dateValidation,
      },
    })
  }

  public async lireStatutTotpSuperAdmin(utilisateurId: string): Promise<boolean> {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: { superAdminTotpActive: true },
    })

    return Boolean(utilisateur?.superAdminTotpActive)
  }

  public async listerAuditsSecurite(limite: number): Promise<DonneesAuditSecurite[]> {
    const audits = await this.prisma.journalAudit.findMany({
      orderBy: { creeLe: 'desc' },
      take: limite,
    })

    return audits.map((audit) => ({
      id: audit.id,
      action: audit.action,
      statut: audit.statut,
      details: audit.details,
      adresseIp: audit.adresseIp,
      agentUtilisateur: audit.agentUtilisateur,
      creeLe: audit.creeLe,
      utilisateurId: audit.utilisateurId,
    }))
  }

  public async marquerCompromissionSessionEtRevoquerJetons(
    sessionId: string,
    dateCompromission: Date
  ): Promise<void> {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.sessionAuthentification.updateMany({
        where: { id: sessionId, compromissionDetecteeLe: null },
        data: {
          compromissionDetecteeLe: dateCompromission,
          revoqueeLe: dateCompromission,
        },
      })
      await tx.jetonRefresh.updateMany({
        where: { sessionId, revoqueLe: null },
        data: { revoqueLe: dateCompromission },
      })
    })
  }

  public async listerTentativesEchecRecentes(
    identifiant: string,
    adresseIp: string,
    type: TypeTentativeConnexionAuthentification,
    dateDebutFenetre: Date,
    limite: number
  ): Promise<DonneesTentativeConnexion[]> {
    const echecs = await this.prisma.tentativeConnexion.findMany({
      where: {
        identifiant,
        adresseIp,
        type,
        succes: false,
        creeLe: { gte: dateDebutFenetre },
      },
      orderBy: { creeLe: 'desc' },
      take: limite,
      select: {
        id: true,
        identifiant: true,
        adresseIp: true,
        type: true,
        succes: true,
        creeLe: true,
        utilisateurId: true,
      },
    })

    return echecs.map((tentative) => ({
      id: tentative.id,
      identifiant: tentative.identifiant,
      adresseIp: tentative.adresseIp,
      type: tentative.type,
      succes: tentative.succes,
      creeLe: tentative.creeLe,
      utilisateurId: tentative.utilisateurId,
    }))
  }

  public async enregistrerTentativeConnexion(entree: EntreeTentativeConnexion): Promise<void> {
    await this.prisma.tentativeConnexion.create({
      data: {
        id: entree.id,
        identifiant: entree.identifiant,
        adresseIp: entree.adresseIp,
        type: entree.type,
        succes: entree.succes,
        creeLe: entree.creeLe,
        utilisateurId: entree.utilisateurId || null,
      },
    })
  }

  private mapperUtilisateur(utilisateur: {
    id: string
    telephone: string
    email: string
    motDePasseHache: string
    role: string
    statut: string
    superAdminTotpActive: boolean
    superAdminTotpSecret: string | null
    permissions: Array<{ code: string; autorise: boolean }>
  }): DonneesUtilisateurAuthentification {
    return {
      id: utilisateur.id,
      telephone: utilisateur.telephone,
      email: utilisateur.email,
      motDePasseHache: utilisateur.motDePasseHache,
      role: utilisateur.role,
      statut: utilisateur.statut,
      superAdminTotpActive: utilisateur.superAdminTotpActive,
      superAdminTotpSecret: utilisateur.superAdminTotpSecret,
      permissions: utilisateur.permissions.map((permission) => ({
        code: permission.code,
        autorise: permission.autorise,
      })),
    }
  }

  private mapperSession(session: {
    id: string
    jetonAccesJti: string
    jetonAccesExpireLe: Date
    csrfToken: string
    adresseIp: string | null
    agentUtilisateur: string | null
    secondeAuthValideeLe: Date | null
    expireLe: Date
    revoqueeLe: Date | null
    compromissionDetecteeLe: Date | null
    utilisateur: {
      id: string
      telephone: string
      email: string
      motDePasseHache: string
      role: string
      statut: string
      superAdminTotpActive: boolean
      superAdminTotpSecret: string | null
      permissions: Array<{ code: string; autorise: boolean }>
    }
  }): DonneesSessionAuthentification {
    return {
      id: session.id,
      jetonAccesJti: session.jetonAccesJti,
      jetonAccesExpireLe: session.jetonAccesExpireLe,
      csrfToken: session.csrfToken,
      adresseIp: session.adresseIp || '127.0.0.1',
      agentUtilisateur: session.agentUtilisateur || 'unknown',
      secondeAuthValideeLe: session.secondeAuthValideeLe,
      expireLe: session.expireLe,
      revoqueeLe: session.revoqueeLe,
      compromissionDetecteeLe: session.compromissionDetecteeLe,
      utilisateur: this.mapperUtilisateur(session.utilisateur),
    }
  }

  private mapperJetonRefresh(jeton: {
    id: string
    hachageToken: string
    sessionId: string
    expireLe: Date
    utiliseLe: Date | null
    revoqueLe: Date | null
    remplaceParId: string | null
    session: {
      id: string
      jetonAccesJti: string
      jetonAccesExpireLe: Date
      csrfToken: string
      adresseIp: string | null
      agentUtilisateur: string | null
      secondeAuthValideeLe: Date | null
      expireLe: Date
      revoqueeLe: Date | null
      compromissionDetecteeLe: Date | null
      utilisateur: {
        id: string
        telephone: string
        email: string
        motDePasseHache: string
        role: string
        statut: string
        superAdminTotpActive: boolean
        superAdminTotpSecret: string | null
        permissions: Array<{ code: string; autorise: boolean }>
      }
    }
  }): DonneesJetonRefreshAuthentification {
    return {
      id: jeton.id,
      hachageToken: jeton.hachageToken,
      sessionId: jeton.sessionId,
      expireLe: jeton.expireLe,
      utiliseLe: jeton.utiliseLe,
      revoqueLe: jeton.revoqueLe,
      remplaceParId: jeton.remplaceParId,
      session: this.mapperSession(jeton.session),
    }
  }
}
