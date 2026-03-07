import { FabriqueJetonRefresh } from '@/src/application/fabriques/FabriqueJetonRefresh'
import { FabriqueSessionAuthentification } from '@/src/application/fabriques/FabriqueSessionAuthentification'
import { InterfaceServiceHachageMotDePasse } from '@/src/coeur/interfaces/InterfaceServiceHachageMotDePasse'
import { InterfaceServiceJetonAcces } from '@/src/coeur/interfaces/InterfaceServiceJetonAcces'
import { InterfaceServiceAuditSecurite } from '@/src/coeur/interfaces/InterfaceServiceAuditSecurite'
import { InterfaceUtilitairesSecurite } from '@/src/coeur/interfaces/InterfaceUtilitairesSecurite'
import { ConfigurationSecurite } from '@/src/coeur/configuration/ConfigurationSecurite'
import { InterfaceRepositoryAuthentification } from '@/src/domaine/interfaces/repository/InterfaceRepositoryAuthentification'
import { MappeurUtilisateurAuthentification } from '@/src/application/mappers'
import { ServiceSecuriteSessionAuthentification } from '@/src/application/services/authentification/ServiceSecuriteSessionAuthentification'
import { TypeContexteRequeteAuthentification } from '@/src/domaine/types/authentification/TypeContexteRequeteAuthentification'
import { TypeResultatConnexionAuthentification } from '@/src/domaine/types/authentification/TypeResultatConnexionAuthentification'
import { TypeResultatRafraichissementAuthentification } from '@/src/domaine/types/authentification/TypeResultatRafraichissementAuthentification'
import { VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION } from '@/src/domaine/types/authentification/TypeTentativeConnexionAuthentification'
import { t } from '@/src/messages'
import { ERRORS } from '@/src/messages/app/errors'
import {
  ExceptionAuthentification,
  ExceptionAuthentificationAutorisation,
  ExceptionAuthentificationValidation,
} from '@/src/application/exceptions'

type TypeReglesSessionRuntime = {
  sessionDurationMinutes: number
  inactivityTimeoutMinutes: number
}

export class ServiceSessionAuthentification {
  constructor(
    private readonly repositoryAuthentification: InterfaceRepositoryAuthentification,
    private readonly serviceHachage: InterfaceServiceHachageMotDePasse,
    private readonly serviceJetonAcces: InterfaceServiceJetonAcces,
    private readonly serviceAudit: InterfaceServiceAuditSecurite,
    private readonly configurationSecurite: ConfigurationSecurite,
    private readonly utilitairesSecurite: InterfaceUtilitairesSecurite,
    private readonly fabriqueSessionAuthentification: FabriqueSessionAuthentification,
    private readonly fabriqueJetonRefresh: FabriqueJetonRefresh,
    private readonly mappeurUtilisateurAuthentification: MappeurUtilisateurAuthentification,
    private readonly serviceSecuriteSessionAuthentification: ServiceSecuriteSessionAuthentification,
    private readonly lireReglesSessionRuntime?: () => Promise<TypeReglesSessionRuntime>
  ) {}

  private async lireReglesSession(): Promise<{
    dureeSessionSecondes: number
    timeoutInactiviteSecondes: number
    dureeJetonAccesSecondes: number
    dureeJetonRefreshSecondes: number
  }> {
    const dureeSessionParDefaut = Math.max(60, this.configurationSecurite.dureeSessionSecondes())
    const timeoutInactiviteParDefaut = Math.max(
      60,
      this.configurationSecurite.dureeJetonAccesSecondes()
    )
    const dureeJetonAccesSecondes = Math.max(60, this.configurationSecurite.dureeJetonAccesSecondes())
    const dureeJetonRefreshSecondes = Math.max(60, this.configurationSecurite.dureeJetonRefreshSecondes())

    if (!this.lireReglesSessionRuntime) {
      return {
        dureeSessionSecondes: dureeSessionParDefaut,
        timeoutInactiviteSecondes: timeoutInactiviteParDefaut,
        dureeJetonAccesSecondes,
        dureeJetonRefreshSecondes,
      }
    }

    try {
      const regles = await this.lireReglesSessionRuntime()
      const dureeSessionSecondes = Math.max(
        60,
        Math.floor(Number(regles.sessionDurationMinutes || 0) * 60) || dureeSessionParDefaut
      )
      const timeoutInactiviteSecondes = Math.max(
        60,
        Math.floor(Number(regles.inactivityTimeoutMinutes || 0) * 60) || timeoutInactiviteParDefaut
      )
      return {
        dureeSessionSecondes,
        timeoutInactiviteSecondes: Math.min(timeoutInactiviteSecondes, dureeSessionSecondes),
        dureeJetonAccesSecondes,
        dureeJetonRefreshSecondes,
      }
    } catch {
      return {
        dureeSessionSecondes: dureeSessionParDefaut,
        timeoutInactiviteSecondes: timeoutInactiviteParDefaut,
        dureeJetonAccesSecondes,
        dureeJetonRefreshSecondes,
      }
    }
  }

  public async connexion(
    identifiant: string,
    motDePasse: string,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<TypeResultatConnexionAuthentification> {
    await this.serviceSecuriteSessionAuthentification.verifierBlocage(
      identifiant,
      contexte.adresseIp,
      VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.LOGIN
    )

    const utilisateur = await this.repositoryAuthentification.rechercherUtilisateurParTelephoneOuEmail(
      identifiant
    )

    if (!utilisateur) {
      await this.serviceSecuriteSessionAuthentification.enregistrerTentative(
        identifiant,
        contexte.adresseIp,
        VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.LOGIN,
        false
      )
      await this.serviceAudit.enregistrer({
        action: 'AUTH_LOGIN_FAILED',
        statut: 'ECHEC',
        details: 'Utilisateur introuvable',
        adresseIp: contexte.adresseIp,
        agentUtilisateur: contexte.agentUtilisateur,
      })
      throw new ExceptionAuthentification(t(ERRORS.AUTH_IDENTIFIANTS_INVALIDES))
    }

    if (!utilisateur.estActif()) {
      await this.serviceSecuriteSessionAuthentification.enregistrerTentative(
        identifiant,
        contexte.adresseIp,
        VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.LOGIN,
        false,
        utilisateur.id
      )
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_COMPTE_INACTIF))
    }

    const motDePasseValide = await this.serviceHachage.verifier(
      motDePasse,
      utilisateur.motDePasseHache
    )

    if (!motDePasseValide) {
      await this.serviceSecuriteSessionAuthentification.enregistrerTentative(
        identifiant,
        contexte.adresseIp,
        VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.LOGIN,
        false,
        utilisateur.id
      )
      await this.serviceAudit.enregistrer({
        utilisateurId: utilisateur.id,
        action: 'AUTH_LOGIN_FAILED',
        statut: 'ECHEC',
        details: 'Mot de passe invalide',
        adresseIp: contexte.adresseIp,
        agentUtilisateur: contexte.agentUtilisateur,
      })
      throw new ExceptionAuthentification(t(ERRORS.AUTH_IDENTIFIANTS_INVALIDES))
    }

    await this.serviceSecuriteSessionAuthentification.enregistrerTentative(
      identifiant,
      contexte.adresseIp,
      VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.LOGIN,
      true,
      utilisateur.id
    )

    // Emission initiale d'une paire access/refresh + CSRF par session.
    const sessionId = this.utilitairesSecurite.tokenAleatoire(18)
    const jti = this.utilitairesSecurite.tokenAleatoire(18)
    const jetonRefresh = this.utilitairesSecurite.tokenAleatoire(48)
    const csrfToken = this.utilitairesSecurite.tokenAleatoire(24)
    const hachageRefresh = this.utilitairesSecurite.hachageSha256(jetonRefresh)
    const maintenant = new Date()
    const reglesSession = await this.lireReglesSession()
    const expirationSession = new Date(
      maintenant.getTime() + reglesSession.dureeSessionSecondes * 1000
    )
    const expirationRefresh = new Date(
      Math.min(
        maintenant.getTime() + reglesSession.dureeJetonRefreshSecondes * 1000,
        expirationSession.getTime()
      )
    )
    const expirationAcces = new Date(
      Math.min(
        maintenant.getTime() + reglesSession.timeoutInactiviteSecondes * 1000,
        expirationSession.getTime()
      )
    )

    const session = this.fabriqueSessionAuthentification.creerNouvelleSession({
      sessionId,
      utilisateur,
      jetonAccesJti: jti,
      jetonAccesExpireLe: expirationAcces,
      csrfToken,
      adresseIp: contexte.adresseIp,
      agentUtilisateur: contexte.agentUtilisateur,
      expireLe: expirationSession,
    })
    const jetonRefreshEntite = this.fabriqueJetonRefresh.creerNouveauJeton({
      session,
      hachageToken: hachageRefresh,
      expireLe: expirationRefresh,
    })
    // L'ecriture persistance est atomique cote repository/DAO.
    await this.repositoryAuthentification.creerSessionEtJetonRefresh({
      session,
      jetonRefresh: jetonRefreshEntite,
    })

    const jetonAcces = await this.serviceJetonAcces.signer({
      sous: utilisateur.id,
      role: String(utilisateur.role).toUpperCase(),
      sessionId,
      jti,
    })

    await this.serviceAudit.enregistrer({
      utilisateurId: utilisateur.id,
      action: 'AUTH_LOGIN_SUCCESS',
      statut: 'SUCCES',
      details: `Connexion reussie (${String(utilisateur.role).toUpperCase()})`,
      adresseIp: contexte.adresseIp,
      agentUtilisateur: contexte.agentUtilisateur,
    })

    return {
      user: this.mappeurUtilisateurAuthentification.versDto(
        utilisateur,
        null,
        utilisateur.codesPermissionsAutorisees()
      ),
      jetonAcces,
      jetonRefresh,
      csrfToken,
    }
  }

  public async rafraichirSession(
    jetonRefreshClair: string,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<TypeResultatRafraichissementAuthentification> {
    await this.serviceSecuriteSessionAuthentification.verifierBlocage(
      'refresh',
      contexte.adresseIp,
      VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.REFRESH
    )

    const hachageRefresh = this.utilitairesSecurite.hachageSha256(jetonRefreshClair)
    const jetonStocke = await this.repositoryAuthentification.rechercherJetonRefreshParHachageAvecSession(
      hachageRefresh
    )

    if (!jetonStocke || !jetonStocke.session || !jetonStocke.session.utilisateur) {
      await this.serviceSecuriteSessionAuthentification.enregistrerTentative(
        'refresh',
        contexte.adresseIp,
        VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.REFRESH,
        false
      )
      throw new ExceptionAuthentification(t(ERRORS.AUTH_REFRESH_INVALIDE))
    }

    const session = jetonStocke.session
    const utilisateur = session.utilisateur
    const maintenant = new Date()

    if (session.estRevoqueeOuCompromise()) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_SESSION_REVOQUEE))
    }

    if (session.estExpiree(maintenant)) {
      await this.repositoryAuthentification.revoquerSessionEtJetonsRefresh(session.id, maintenant)
      throw new ExceptionAuthentification(t(ERRORS.AUTH_SESSION_EXPIREE))
    }

    if (session.jetonAccesExpireLe.getTime() <= maintenant.getTime()) {
      await this.repositoryAuthentification.revoquerSessionEtJetonsRefresh(session.id, maintenant)
      throw new ExceptionAuthentification(t(ERRORS.AUTH_SESSION_EXPIREE))
    }

    // Si un refresh deja utilise/revoque revient, on considere une compromission potentielle.
    if (jetonStocke.estUtiliseOuRevoque()) {
      if (jetonStocke.remplaceParId) {
        await this.serviceSecuriteSessionAuthentification.signalerReutilisationRefresh(
          session.id,
          utilisateur.id,
          contexte
        )
      }
      throw new ExceptionAuthentification(t(ERRORS.AUTH_REFRESH_DEJA_UTILISE))
    }

    if (jetonStocke.estExpire()) {
      await this.repositoryAuthentification.revoquerJetonRefreshParId(jetonStocke.id, maintenant)
      throw new ExceptionAuthentification(t(ERRORS.AUTH_REFRESH_EXPIRE))
    }

    const reglesSession = await this.lireReglesSession()
    const expirationRefresh = new Date(
      Math.min(
        maintenant.getTime() + reglesSession.dureeJetonRefreshSecondes * 1000,
        session.expireLe.getTime()
      )
    )
    const expirationAcces = new Date(
      Math.min(
        maintenant.getTime() + reglesSession.timeoutInactiviteSecondes * 1000,
        session.expireLe.getTime()
      )
    )
    const nouveauRefresh = this.utilitairesSecurite.tokenAleatoire(48)
    const nouveauRefreshHash = this.utilitairesSecurite.hachageSha256(nouveauRefresh)
    const nouveauJti = this.utilitairesSecurite.tokenAleatoire(18)
    const nouveauCsrf = this.utilitairesSecurite.tokenAleatoire(24)

    if (expirationRefresh.getTime() <= maintenant.getTime()) {
      await this.repositoryAuthentification.revoquerSessionEtJetonsRefresh(session.id, maintenant)
      throw new ExceptionAuthentification(t(ERRORS.AUTH_SESSION_EXPIREE))
    }

    // Rotation stricte: nouveau refresh + invalidation de l'ancien + mise a jour JTI/CSRF/IP/UA.
    const sessionApresRotation = this.fabriqueSessionAuthentification.creerSessionApresRotation({
      sessionExistante: session,
      nouveauJetonAccesJti: nouveauJti,
      nouveauJetonAccesExpireLe: expirationAcces,
      nouveauCsrfToken: nouveauCsrf,
      adresseIp: contexte.adresseIp,
      agentUtilisateur: contexte.agentUtilisateur,
    })
    const nouveauJetonRefreshEntite = this.fabriqueJetonRefresh.creerNouveauJeton({
      session: sessionApresRotation,
      hachageToken: nouveauRefreshHash,
      expireLe: expirationRefresh,
    })
    await this.repositoryAuthentification.effectuerRotationJetonRefresh({
      session: sessionApresRotation,
      jetonRefreshActuelId: jetonStocke.id,
      nouveauJetonRefresh: nouveauJetonRefreshEntite,
      dateRotation: maintenant,
    })

    const jetonAcces = await this.serviceJetonAcces.signer({
      sous: utilisateur.id,
      role: String(utilisateur.role).toUpperCase(),
      sessionId: session.id,
      jti: nouveauJti,
    })

    await this.serviceSecuriteSessionAuthentification.enregistrerTentative(
      'refresh',
      contexte.adresseIp,
      VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.REFRESH,
      true,
      utilisateur.id
    )
    await this.serviceAudit.enregistrer({
      utilisateurId: utilisateur.id,
      action: 'AUTH_REFRESH_SUCCESS',
      statut: 'SUCCES',
      details: 'Refresh token rotation validee',
      adresseIp: contexte.adresseIp,
      agentUtilisateur: contexte.agentUtilisateur,
    })

    return {
      user: this.mappeurUtilisateurAuthentification.versDto(
        utilisateur,
        session.secondeAuthValideeLe,
        utilisateur.codesPermissionsAutorisees()
      ),
      jetonAcces,
      jetonRefresh: nouveauRefresh,
      csrfToken: nouveauCsrf,
    }
  }

  public async deconnexion(
    jetonAcces: string | null,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<void> {
    if (!jetonAcces) return

    try {
      const charge = await this.serviceJetonAcces.verifier(jetonAcces)
      if (!charge.sessionId) return

      await this.repositoryAuthentification.revoquerSessionEtJetonsRefresh(
        charge.sessionId,
        new Date()
      )

      await this.serviceAudit.enregistrer({
        utilisateurId: charge.sous,
        action: 'AUTH_LOGOUT',
        statut: 'SUCCES',
        details: 'Session terminee',
        adresseIp: contexte.adresseIp,
        agentUtilisateur: contexte.agentUtilisateur,
      })
    } catch {
      // logout best effort
    }
  }

  public async changerMotDePasse(
    jetonAcces: string,
    motDePasseActuel: string,
    nouveauMotDePasse: string,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<void> {
    const charge = await this.serviceJetonAcces.verifier(jetonAcces)
    if (!charge.sous || !charge.sessionId || !charge.jti) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_JETON_ACCES_INVALIDE))
    }

    const session = await this.repositoryAuthentification.rechercherSessionParIdAvecUtilisateur(
      charge.sessionId
    )

    if (!session?.utilisateur) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_SESSION_INTROUVABLE))
    }

    if (session.estRevoqueeOuCompromise()) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_SESSION_REVOQUEE))
    }

    if (session.estExpiree()) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_SESSION_EXPIREE))
    }

    if (session.jetonAccesExpireLe.getTime() <= Date.now()) {
      await this.repositoryAuthentification.revoquerSessionEtJetonsRefresh(session.id, new Date())
      throw new ExceptionAuthentification(t(ERRORS.AUTH_SESSION_EXPIREE))
    }

    if (!session.jetonAccesCorrespond(charge.jti)) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_JETON_ACCES_OBSOLETE))
    }

    const role = String(session.utilisateur.role || '').toUpperCase()
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      await this.serviceAudit.enregistrer({
        utilisateurId: session.utilisateur.id,
        action: 'AUTH_PASSWORD_CHANGE_DENIED',
        statut: 'ECHEC',
        details: `Role non autorise (${role || 'UNKNOWN'})`,
        adresseIp: contexte.adresseIp,
        agentUtilisateur: contexte.agentUtilisateur,
      })
      throw new ExceptionAuthentificationAutorisation(
        t(ERRORS.AUTH_CHANGEMENT_MOT_DE_PASSE_RESERVE),
        {
          code: 'PASSWORD_CHANGE_ROLE_FORBIDDEN',
        }
      )
    }

    if (role === 'SUPER_ADMIN' && !session.secondeAuthValideeLe) {
      throw new ExceptionAuthentificationAutorisation(
        t(ERRORS.AUTH_SECONDE_AUTH_SUPER_ADMIN_REQUISE),
        {
          code: 'SUPER_ADMIN_SECOND_AUTH_REQUIRED',
        }
      )
    }

    const motDePasseActuelValide = await this.serviceHachage.verifier(
      motDePasseActuel,
      session.utilisateur.motDePasseHache
    )

    if (!motDePasseActuelValide) {
      await this.serviceAudit.enregistrer({
        utilisateurId: session.utilisateur.id,
        action: 'AUTH_PASSWORD_CHANGE_FAILED',
        statut: 'ECHEC',
        details: 'Mot de passe actuel invalide',
        adresseIp: contexte.adresseIp,
        agentUtilisateur: contexte.agentUtilisateur,
      })
      throw new ExceptionAuthentification(
        t(ERRORS.AUTH_MOT_DE_PASSE_ACTUEL_INVALIDE),
        { code: 'CURRENT_PASSWORD_INVALID' }
      )
    }

    if (motDePasseActuel === nouveauMotDePasse) {
      throw new ExceptionAuthentificationValidation(
        t(ERRORS.AUTH_NOUVEAU_MOT_DE_PASSE_IDENTIQUE),
        { code: 'PASSWORD_UNCHANGED' }
      )
    }

    const nouveauMotDePasseHache = await this.serviceHachage.hacher(nouveauMotDePasse)
    await this.repositoryAuthentification.mettreAJourMotDePasseUtilisateur(
      session.utilisateur.id,
      nouveauMotDePasseHache
    )

    const sessionsRevoquees = await this.repositoryAuthentification.revoquerAutresSessionsUtilisateur(
      session.utilisateur.id,
      session.id,
      new Date()
    )

    await this.serviceAudit.enregistrer({
      utilisateurId: session.utilisateur.id,
      action: 'AUTH_PASSWORD_CHANGED',
      statut: 'SUCCES',
      details: `Mot de passe mis a jour. Autres sessions revoquees: ${sessionsRevoquees}`,
      adresseIp: contexte.adresseIp,
      agentUtilisateur: contexte.agentUtilisateur,
    })
  }
}
