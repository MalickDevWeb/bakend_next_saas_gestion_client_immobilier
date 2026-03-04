import { randomUUID } from 'node:crypto'
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

type ModeleSessionMemoire = {
  id: string
  utilisateurId: string
  jetonAccesJti: string
  jetonAccesExpireLe: Date
  csrfToken: string
  adresseIp: string
  agentUtilisateur: string
  secondeAuthValideeLe: Date | null
  expireLe: Date
  revoqueeLe: Date | null
  compromissionDetecteeLe: Date | null
}

type ModeleJetonRefreshMemoire = {
  id: string
  sessionId: string
  hachageToken: string
  expireLe: Date
  utiliseLe: Date | null
  revoqueLe: Date | null
  remplaceParId: string | null
}

export class DaoAuthentificationMemoire implements InterfaceDaoAuthentification {
  private readonly utilisateurs = new Map<string, DonneesUtilisateurAuthentification>()
  private readonly sessions = new Map<string, ModeleSessionMemoire>()
  private readonly jetonsRefreshParId = new Map<string, ModeleJetonRefreshMemoire>()
  private readonly indexJetonsRefreshParHachage = new Map<string, string>()
  private readonly tentativesConnexion: DonneesTentativeConnexion[] = []
  private readonly journauxAudit: DonneesAuditSecurite[] = []

  constructor(utilisateursInitiaux: DonneesUtilisateurAuthentification[] = []) {
    utilisateursInitiaux.forEach((utilisateur) => {
      this.utilisateurs.set(utilisateur.id, this.clonerUtilisateur(utilisateur))
    })
  }

  public async rechercherUtilisateurParTelephoneOuEmail(
    identifiant: string
  ): Promise<DonneesUtilisateurAuthentification | null> {
    const identifiantNormalise = String(identifiant || '').trim().toLowerCase()
    for (const utilisateur of this.utilisateurs.values()) {
      const telephone = utilisateur.telephone.toLowerCase()
      const email = utilisateur.email.toLowerCase()
      if (telephone === identifiantNormalise || email === identifiantNormalise) {
        return this.clonerUtilisateur(utilisateur)
      }
    }
    return null
  }

  public async rechercherUtilisateurParId(
    utilisateurId: string
  ): Promise<DonneesUtilisateurAuthentification | null> {
    const id = String(utilisateurId || '').trim()
    if (!id) return null

    const utilisateur = this.utilisateurs.get(id)
    if (!utilisateur) return null
    return this.clonerUtilisateur(utilisateur)
  }

  public async creerSessionEtJetonRefresh(
    entree: EntreeCreationSessionAuthentification
  ): Promise<void> {
    const utilisateur = this.utilisateurs.get(entree.utilisateurId)
    if (!utilisateur) {
      throw new Error('Utilisateur introuvable dans la memoire auth')
    }

    const session: ModeleSessionMemoire = {
      id: entree.sessionId,
      utilisateurId: utilisateur.id,
      jetonAccesJti: entree.jetonAccesJti,
      jetonAccesExpireLe: entree.jetonAccesExpireLe,
      csrfToken: entree.csrfToken,
      adresseIp: entree.adresseIp,
      agentUtilisateur: entree.agentUtilisateur,
      secondeAuthValideeLe: null,
      expireLe: entree.expireLeSession,
      revoqueeLe: null,
      compromissionDetecteeLe: null,
    }

    const jetonRefresh: ModeleJetonRefreshMemoire = {
      id: randomUUID(),
      sessionId: entree.sessionId,
      hachageToken: entree.hachageJetonRefresh,
      expireLe: entree.expireLeRefresh,
      utiliseLe: null,
      revoqueLe: null,
      remplaceParId: null,
    }

    this.sessions.set(session.id, session)
    this.jetonsRefreshParId.set(jetonRefresh.id, jetonRefresh)
    this.indexJetonsRefreshParHachage.set(jetonRefresh.hachageToken, jetonRefresh.id)
  }

  public async rechercherSessionParIdAvecUtilisateur(
    sessionId: string
  ): Promise<DonneesSessionAuthentification | null> {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    const utilisateur = this.utilisateurs.get(session.utilisateurId)
    if (!utilisateur) return null

    return this.mapperSession(session, utilisateur)
  }

  public async rechercherJetonRefreshParHachageAvecSession(
    hachageToken: string
  ): Promise<DonneesJetonRefreshAuthentification | null> {
    const jetonId = this.indexJetonsRefreshParHachage.get(hachageToken)
    if (!jetonId) return null

    const jeton = this.jetonsRefreshParId.get(jetonId)
    if (!jeton) return null

    const session = this.sessions.get(jeton.sessionId)
    if (!session) return null

    const utilisateur = this.utilisateurs.get(session.utilisateurId)
    if (!utilisateur) return null

    return {
      id: jeton.id,
      sessionId: jeton.sessionId,
      hachageToken: jeton.hachageToken,
      expireLe: jeton.expireLe,
      utiliseLe: jeton.utiliseLe,
      revoqueLe: jeton.revoqueLe,
      remplaceParId: jeton.remplaceParId,
      session: this.mapperSession(session, utilisateur),
    }
  }

  public async revoquerJetonRefreshParId(
    jetonRefreshId: string,
    dateRevocation: Date
  ): Promise<void> {
    const jeton = this.jetonsRefreshParId.get(jetonRefreshId)
    if (!jeton) return
    jeton.revoqueLe = new Date(dateRevocation)
    this.jetonsRefreshParId.set(jeton.id, jeton)
  }

  public async effectuerRotationJetonRefresh(entree: EntreeRotationJetonRefresh): Promise<void> {
    const jetonActuel = this.jetonsRefreshParId.get(entree.jetonRefreshActuelId)
    const session = this.sessions.get(entree.sessionId)
    if (!jetonActuel || !session) {
      throw new Error('Rotation refresh impossible: session ou jeton introuvable')
    }

    const nouveauJetonId = randomUUID()
    const nouveauJeton: ModeleJetonRefreshMemoire = {
      id: nouveauJetonId,
      sessionId: entree.sessionId,
      hachageToken: entree.hachageNouveauJetonRefresh,
      expireLe: entree.expireLeRefresh,
      utiliseLe: null,
      revoqueLe: null,
      remplaceParId: null,
    }

    jetonActuel.utiliseLe = entree.dateRotation
    jetonActuel.revoqueLe = entree.dateRotation
    jetonActuel.remplaceParId = nouveauJetonId

    session.jetonAccesJti = entree.nouveauJtiJetonAcces
    session.jetonAccesExpireLe = entree.expireLeJetonAcces
    session.csrfToken = entree.nouveauCsrfToken
    session.adresseIp = entree.adresseIp
    session.agentUtilisateur = entree.agentUtilisateur

    this.jetonsRefreshParId.set(jetonActuel.id, jetonActuel)
    this.jetonsRefreshParId.set(nouveauJetonId, nouveauJeton)
    this.indexJetonsRefreshParHachage.set(nouveauJeton.hachageToken, nouveauJetonId)
    this.sessions.set(session.id, session)
  }

  public async revoquerSessionEtJetonsRefresh(
    sessionId: string,
    dateRevocation: Date
  ): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (session && !session.revoqueeLe) {
      session.revoqueeLe = new Date(dateRevocation)
      this.sessions.set(session.id, session)
    }

    for (const jeton of this.jetonsRefreshParId.values()) {
      if (jeton.sessionId === sessionId && !jeton.revoqueLe) {
        jeton.revoqueLe = new Date(dateRevocation)
      }
    }
  }

  public async activerTotpSuperAdmin(utilisateurId: string, secretChiffre: string): Promise<void> {
    const utilisateur = this.utilisateurs.get(utilisateurId)
    if (!utilisateur) {
      throw new Error('Utilisateur introuvable')
    }
    utilisateur.superAdminTotpActive = true
    utilisateur.superAdminTotpSecret = secretChiffre
    this.utilisateurs.set(utilisateurId, utilisateur)
  }

  public async rechercherTotpSuperAdmin(utilisateurId: string): Promise<{
    id: string
    superAdminTotpActive: boolean
    superAdminTotpSecret: string | null
  } | null> {
    const utilisateur = this.utilisateurs.get(utilisateurId)
    if (!utilisateur) return null
    return {
      id: utilisateur.id,
      superAdminTotpActive: utilisateur.superAdminTotpActive,
      superAdminTotpSecret: utilisateur.superAdminTotpSecret,
    }
  }

  public async definirSecondeAuthSession(sessionId: string, dateValidation: Date): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.secondeAuthValideeLe = new Date(dateValidation)
    this.sessions.set(session.id, session)
  }

  public async lireStatutTotpSuperAdmin(utilisateurId: string): Promise<boolean> {
    return Boolean(this.utilisateurs.get(utilisateurId)?.superAdminTotpActive)
  }

  public async listerAuditsSecurite(limite: number): Promise<DonneesAuditSecurite[]> {
    return [...this.journauxAudit]
      .sort((a, b) => b.creeLe.getTime() - a.creeLe.getTime())
      .slice(0, limite)
      .map((audit) => ({ ...audit }))
  }

  public async marquerCompromissionSessionEtRevoquerJetons(
    sessionId: string,
    dateCompromission: Date
  ): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (session && !session.compromissionDetecteeLe) {
      session.compromissionDetecteeLe = new Date(dateCompromission)
      session.revoqueeLe = new Date(dateCompromission)
      this.sessions.set(session.id, session)
    }

    for (const jeton of this.jetonsRefreshParId.values()) {
      if (jeton.sessionId === sessionId && !jeton.revoqueLe) {
        jeton.revoqueLe = new Date(dateCompromission)
      }
    }
  }

  public async listerTentativesEchecRecentes(
    identifiant: string,
    adresseIp: string,
    type: TypeTentativeConnexionAuthentification,
    dateDebutFenetre: Date,
    limite: number
  ): Promise<DonneesTentativeConnexion[]> {
    return this.tentativesConnexion
      .filter((tentative) => {
        return (
          tentative.identifiant === identifiant &&
          tentative.adresseIp === adresseIp &&
          tentative.type === type &&
          tentative.succes === false &&
          tentative.creeLe.getTime() >= dateDebutFenetre.getTime()
        )
      })
      .sort((a, b) => b.creeLe.getTime() - a.creeLe.getTime())
      .slice(0, limite)
      .map((tentative) => ({ ...tentative }))
  }

  public async enregistrerTentativeConnexion(entree: EntreeTentativeConnexion): Promise<void> {
    this.tentativesConnexion.push({
      id: entree.id || randomUUID(),
      identifiant: entree.identifiant,
      adresseIp: entree.adresseIp,
      type: entree.type,
      succes: entree.succes,
      creeLe: entree.creeLe || new Date(),
      utilisateurId: entree.utilisateurId || null,
    })
  }

  public ajouterOuRemplacerUtilisateur(utilisateur: DonneesUtilisateurAuthentification): void {
    this.utilisateurs.set(utilisateur.id, this.clonerUtilisateur(utilisateur))
  }

  public ajouterAuditSecurite(audit: DonneesAuditSecurite): void {
    this.journauxAudit.push({ ...audit })
  }

  private mapperSession(
    session: ModeleSessionMemoire,
    utilisateur: DonneesUtilisateurAuthentification
  ): DonneesSessionAuthentification {
    return {
      id: session.id,
      jetonAccesJti: session.jetonAccesJti,
      jetonAccesExpireLe: session.jetonAccesExpireLe,
      csrfToken: session.csrfToken,
      adresseIp: session.adresseIp,
      agentUtilisateur: session.agentUtilisateur,
      secondeAuthValideeLe: session.secondeAuthValideeLe,
      expireLe: session.expireLe,
      revoqueeLe: session.revoqueeLe,
      compromissionDetecteeLe: session.compromissionDetecteeLe,
      utilisateur: this.clonerUtilisateur(utilisateur),
    }
  }

  private clonerUtilisateur(
    utilisateur: DonneesUtilisateurAuthentification
  ): DonneesUtilisateurAuthentification {
    return {
      ...utilisateur,
      permissions: utilisateur.permissions.map((permission) => ({ ...permission })),
    }
  }
}
