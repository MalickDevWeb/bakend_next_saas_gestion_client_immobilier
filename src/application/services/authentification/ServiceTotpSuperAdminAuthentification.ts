import { ConfigurationApplication } from '@/src/coeur/configuration/ConfigurationApplication'
import {
  DtoReponseAuthentification,
  DtoStatutTotpSuperAdmin,
} from '@/src/application/dtos/authentification/DtoAuthentification'
import { InterfaceServiceTotp } from '@/src/coeur/interfaces/InterfaceServiceTotp'
import { InterfaceServiceChiffrement } from '@/src/coeur/interfaces/InterfaceServiceChiffrement'
import { InterfaceServiceAuditSecurite } from '@/src/coeur/interfaces/InterfaceServiceAuditSecurite'
import { InterfaceServiceHachageMotDePasse } from '@/src/coeur/interfaces/InterfaceServiceHachageMotDePasse'
import { InterfaceRepositoryAuthentification } from '@/src/domaine/interfaces/repository/InterfaceRepositoryAuthentification'
import { ServiceContexteAuthentification } from '@/src/application/services/authentification/ServiceContexteAuthentification'
import { ServiceSecuriteSessionAuthentification } from '@/src/application/services/authentification/ServiceSecuriteSessionAuthentification'
import { TypeContexteRequeteAuthentification } from '@/src/domaine/types/authentification/TypeContexteRequeteAuthentification'
import { TypeResultatTotpInitialisationAuthentification } from '@/src/domaine/types/authentification/TypeResultatTotpInitialisationAuthentification'
import { VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION } from '@/src/domaine/types/authentification/TypeTentativeConnexionAuthentification'
import { t } from '@/src/messages'
import { ERRORS } from '@/src/messages/app/errors'
import {
  ExceptionAuthentification,
  ExceptionAuthentificationAutorisation,
  ExceptionAuthentificationPrecondition,
} from '@/src/application/exceptions'

export class ServiceTotpSuperAdminAuthentification {
  constructor(
    private readonly serviceContexteAuthentification: ServiceContexteAuthentification,
    private readonly serviceSecuriteSessionAuthentification: ServiceSecuriteSessionAuthentification,
    private readonly repositoryAuthentification: InterfaceRepositoryAuthentification,
    private readonly serviceTotp: InterfaceServiceTotp,
    private readonly serviceChiffrement: InterfaceServiceChiffrement,
    private readonly serviceAudit: InterfaceServiceAuditSecurite,
    private readonly serviceHachage: InterfaceServiceHachageMotDePasse,
    private readonly configurationApplication: ConfigurationApplication
  ) {}

  public async initialiserTotpSuperAdmin(
    jetonAcces: string
  ): Promise<TypeResultatTotpInitialisationAuthentification> {
    const contexte = await this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
      jetonAcces
    )
    if (String(contexte.utilisateur.role || '').toUpperCase() !== 'SUPER_ADMIN') {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_ACCES_SUPER_ADMIN))
    }

    const secret = this.serviceTotp.genererSecret()
    const nomApplication = this.configurationApplication.nomApplication()
    // OTPAuth URL est utilisee par Google Authenticator / Authy / etc.
    const otpAuthUrl = this.serviceTotp.genererOtpAuthUrl(
      nomApplication,
      contexte.utilisateur.nomUtilisateur,
      secret
    )

    return {
      secretTemporaire: secret,
      otpAuthUrl,
      application: nomApplication,
    }
  }

  public async activerTotpSuperAdmin(
    jetonAcces: string,
    secretTemporaire: string,
    codeTotp: string,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<DtoReponseAuthentification> {
    const resultat = await this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
      jetonAcces
    )
    if (String(resultat.utilisateur.role || '').toUpperCase() !== 'SUPER_ADMIN') {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_ACCES_SUPER_ADMIN))
    }

    const codeValide = this.serviceTotp.verifierCode(codeTotp, secretTemporaire)
    if (!codeValide) {
      await this.serviceAudit.enregistrer({
        utilisateurId: resultat.utilisateur.id,
        action: 'AUTH_TOTP_ACTIVATION_FAILED',
        statut: 'ECHEC',
        details: 'Code TOTP invalide',
        adresseIp: contexte.adresseIp,
        agentUtilisateur: contexte.agentUtilisateur,
      })
      throw new ExceptionAuthentification(t(ERRORS.AUTH_TOTP_INVALIDE))
    }

    // Le secret TOTP n'est jamais stocke en clair.
    const secretChiffre = this.serviceChiffrement.chiffrer(secretTemporaire)
    await this.repositoryAuthentification.activerTotpSuperAdmin(
      resultat.utilisateur.id,
      secretChiffre
    )

    await this.serviceAudit.enregistrer({
      utilisateurId: resultat.utilisateur.id,
      action: 'AUTH_TOTP_ACTIVATION_SUCCESS',
      statut: 'SUCCES',
      details: 'TOTP active',
      adresseIp: contexte.adresseIp,
      agentUtilisateur: contexte.agentUtilisateur,
    })

    const contexteFinal = await this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
      jetonAcces
    )
    return {
      user: contexteFinal.utilisateur,
    }
  }

  public async verifierSecondeAuthSuperAdmin(
    jetonAcces: string,
    identifiant: string | null,
    codeTotp: string | null,
    motDePasse: string | null,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<DtoReponseAuthentification> {
    await this.serviceSecuriteSessionAuthentification.verifierBlocage(
      'second-auth',
      contexte.adresseIp,
      VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.SECOND_AUTH
    )

    const contexteUtilisateur = await this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
      jetonAcces
    )
    if (String(contexteUtilisateur.utilisateur.role || '').toUpperCase() !== 'SUPER_ADMIN') {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_ACCES_SUPER_ADMIN))
    }

    const motDePasseSaisi = String(motDePasse || '').trim()
    if (motDePasseSaisi) {
      const identifiantSaisi = String(identifiant || '').trim()
      const identifiantRecherche =
        identifiantSaisi ||
        contexteUtilisateur.utilisateur.nomUtilisateur ||
        contexteUtilisateur.utilisateur.email

      const utilisateurCourant = await this.repositoryAuthentification.rechercherUtilisateurParIdentifiantOuEmail(
        identifiantRecherche
      )

      const motDePasseValide =
        utilisateurCourant?.id === contexteUtilisateur.utilisateur.id &&
        Boolean(utilisateurCourant?.motDePasseHache) &&
        (await this.serviceHachage.verifier(
          motDePasseSaisi,
          utilisateurCourant?.motDePasseHache || ''
        ))

      if (!motDePasseValide || !utilisateurCourant) {
        await this.serviceSecuriteSessionAuthentification.enregistrerTentative(
          'second-auth',
          contexte.adresseIp,
          VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.SECOND_AUTH,
          false,
          contexteUtilisateur.utilisateur.id
        )
        await this.serviceAudit.enregistrer({
          utilisateurId: contexteUtilisateur.utilisateur.id,
          action: 'AUTH_SECOND_AUTH_FAILED',
          statut: 'ECHEC',
          details: 'Mot de passe invalide pour seconde authentification',
          adresseIp: contexte.adresseIp,
          agentUtilisateur: contexte.agentUtilisateur,
        })
        throw new ExceptionAuthentification(t(ERRORS.AUTH_IDENTIFIANTS_INVALIDES))
      }

      await this.repositoryAuthentification.definirSecondeAuthSession(
        contexteUtilisateur.session.id,
        new Date()
      )

      await this.serviceSecuriteSessionAuthentification.enregistrerTentative(
        'second-auth',
        contexte.adresseIp,
        VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.SECOND_AUTH,
        true,
        utilisateurCourant.id
      )
      await this.serviceAudit.enregistrer({
        utilisateurId: utilisateurCourant.id,
        action: 'AUTH_SECOND_AUTH_SUCCESS',
        statut: 'SUCCES',
        details: 'Seconde authentification super admin validee par mot de passe',
        adresseIp: contexte.adresseIp,
        agentUtilisateur: contexte.agentUtilisateur,
      })

      const contexteMisAJour = await this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
        jetonAcces
      )
      return {
        user: contexteMisAJour.utilisateur,
      }
    }

    const codeTotpSaisi = String(codeTotp || '').trim()
    if (!codeTotpSaisi) {
      throw new ExceptionAuthentification(t(ERRORS.PARAMETRES_INVALIDES))
    }

    const utilisateur = await this.repositoryAuthentification.rechercherTotpSuperAdmin(
      contexteUtilisateur.utilisateur.id
    )

    if (!utilisateur || !utilisateur.superAdminTotpActive || !utilisateur.superAdminTotpSecret) {
      throw new ExceptionAuthentificationPrecondition(t(ERRORS.AUTH_TOTP_NON_ACTIVE))
    }

    // Verification TOTP finale avant de marquer la session comme "2FA validee".
    const secret = this.serviceChiffrement.dechiffrer(utilisateur.superAdminTotpSecret)
    const codeValide = this.serviceTotp.verifierCode(codeTotpSaisi, secret)

    if (!codeValide) {
      await this.serviceSecuriteSessionAuthentification.enregistrerTentative(
        'second-auth',
        contexte.adresseIp,
        VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.SECOND_AUTH,
        false,
        utilisateur.id
      )
      await this.serviceAudit.enregistrer({
        utilisateurId: utilisateur.id,
        action: 'AUTH_SECOND_AUTH_FAILED',
        statut: 'ECHEC',
        details: 'Code TOTP invalide',
        adresseIp: contexte.adresseIp,
        agentUtilisateur: contexte.agentUtilisateur,
      })
      throw new ExceptionAuthentification(t(ERRORS.AUTH_TOTP_INVALIDE))
    }

    await this.repositoryAuthentification.definirSecondeAuthSession(
      contexteUtilisateur.session.id,
      new Date()
    )

    await this.serviceSecuriteSessionAuthentification.enregistrerTentative(
      'second-auth',
      contexte.adresseIp,
      VALEURS_TYPE_TENTATIVE_CONNEXION_AUTHENTIFICATION.SECOND_AUTH,
      true,
      utilisateur.id
    )
    await this.serviceAudit.enregistrer({
      utilisateurId: utilisateur.id,
      action: 'AUTH_SECOND_AUTH_SUCCESS',
      statut: 'SUCCES',
      details: 'Seconde authentification super admin validee',
      adresseIp: contexte.adresseIp,
      agentUtilisateur: contexte.agentUtilisateur,
    })

    const contexteMisAJour = await this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
      jetonAcces
    )
    return {
      user: contexteMisAJour.utilisateur,
    }
  }

  public async obtenirStatutTotpSuperAdmin(
    jetonAcces: string
  ): Promise<DtoStatutTotpSuperAdmin> {
    const contexte = await this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
      jetonAcces
    )
    if (String(contexte.utilisateur.role || '').toUpperCase() !== 'SUPER_ADMIN') {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_ACCES_SUPER_ADMIN))
    }

    return {
      totpActive: await this.repositoryAuthentification.lireStatutTotpSuperAdmin(
        contexte.utilisateur.id
      ),
    }
  }
}
