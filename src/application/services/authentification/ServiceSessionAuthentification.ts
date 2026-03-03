import { FabriqueJetonRefresh } from '@/src/application/fabriques/FabriqueJetonRefresh'
import { FabriqueSessionAuthentification } from '@/src/application/fabriques/FabriqueSessionAuthentification'
import { InterfaceServiceHachageMotDePasse } from '@/src/coeur/interfaces/InterfaceServiceHachageMotDePasse'
import { InterfaceServiceJetonAcces } from '@/src/coeur/interfaces/InterfaceServiceJetonAcces'
import { InterfaceServiceAuditSecurite } from '@/src/coeur/interfaces/InterfaceServiceAuditSecurite'
import { InterfaceUtilitairesSecurite } from '@/src/coeur/interfaces/InterfaceUtilitairesSecurite'
import { ConfigurationSecurite } from '@/src/coeur/configuration/ConfigurationSecurite'
import { InterfaceRepositoryAuthentification } from '@/src/domaine/interfaces/repository/InterfaceRepositoryAuthentification'
import { MappeurUtilisateurAuthentification } from '@/src/application/mappers/MappeurUtilisateurAuthentification'
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
} from '@/src/application/exceptions'

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
    private readonly serviceSecuriteSessionAuthentification: ServiceSecuriteSessionAuthentification
  ) {}

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

    const utilisateur = await this.repositoryAuthentification.rechercherUtilisateurParIdentifiantOuEmail(
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
    const expirationSession = new Date(
      maintenant.getTime() + this.configurationSecurite.dureeSessionSecondes() * 1000
    )
    const expirationRefresh = new Date(
      maintenant.getTime() + this.configurationSecurite.dureeJetonRefreshSecondes() * 1000
    )
    const expirationAcces = new Date(
      maintenant.getTime() + this.configurationSecurite.dureeJetonAccesSecondes() * 1000
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
      await this.repositoryAuthentification.revoquerJetonRefreshParId(jetonStocke.id, new Date())
      throw new ExceptionAuthentification(t(ERRORS.AUTH_REFRESH_EXPIRE))
    }

    const maintenant = new Date()
    const expirationRefresh = new Date(
      maintenant.getTime() + this.configurationSecurite.dureeJetonRefreshSecondes() * 1000
    )
    const expirationAcces = new Date(
      maintenant.getTime() + this.configurationSecurite.dureeJetonAccesSecondes() * 1000
    )
    const nouveauRefresh = this.utilitairesSecurite.tokenAleatoire(48)
    const nouveauRefreshHash = this.utilitairesSecurite.hachageSha256(nouveauRefresh)
    const nouveauJti = this.utilitairesSecurite.tokenAleatoire(18)
    const nouveauCsrf = this.utilitairesSecurite.tokenAleatoire(24)

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
}
