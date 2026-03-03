import { BuilderEntiteAuditSecuriteAuthentification } from '@/src/domaine/builders/authentification/BuilderEntiteAuditSecuriteAuthentification'
import { BuilderEntiteJetonRefresh } from '@/src/domaine/builders/authentification/BuilderEntiteJetonRefresh'
import { BuilderEntitePermissionUtilisateurAuth } from '@/src/domaine/builders/authentification/BuilderEntitePermissionUtilisateurAuth'
import { BuilderEntiteSessionAuthentification } from '@/src/domaine/builders/authentification/BuilderEntiteSessionAuthentification'
import { BuilderEntiteTentativeConnexion } from '@/src/domaine/builders/authentification/BuilderEntiteTentativeConnexion'
import { BuilderEntiteUtilisateurAuthentification } from '@/src/domaine/builders/authentification/BuilderEntiteUtilisateurAuthentification'
import { EntiteAuditSecuriteAuthentification } from '@/src/domaine/entites/authentification/EntiteAuditSecuriteAuthentification'
import { EntiteJetonRefresh } from '@/src/domaine/entites/authentification/EntiteJetonRefresh'
import { EntiteSessionAuthentification } from '@/src/domaine/entites/authentification/EntiteSessionAuthentification'
import { EntiteTentativeConnexion } from '@/src/domaine/entites/authentification/EntiteTentativeConnexion'
import { EntiteUtilisateurAuthentification } from '@/src/domaine/entites/authentification/EntiteUtilisateurAuthentification'
import {
  DonneesAuditSecurite,
  DonneesJetonRefreshAuthentification,
  DonneesSessionAuthentification,
  DonneesTentativeConnexion,
  DonneesUtilisateurAuthentification,
  InterfaceDaoAuthentification,
} from '@/src/domaine/interfaces/dao/authentification/InterfaceDaoAuthentification'
import { InterfaceRepositoryAuthentification } from '@/src/domaine/interfaces/repository/InterfaceRepositoryAuthentification'
import { TypeCommandeCreationSessionAuthentification } from '@/src/domaine/types/authentification/TypeCommandeCreationSessionAuthentification'
import { TypeCommandeRotationJetonRefreshAuthentification } from '@/src/domaine/types/authentification/TypeCommandeRotationJetonRefreshAuthentification'
import { TypeTentativeConnexionAuthentification } from '@/src/domaine/types/authentification/TypeTentativeConnexionAuthentification'
import { TypeTotpSuperAdminAuthentification } from '@/src/domaine/types/authentification/TypeTotpSuperAdminAuthentification'

export abstract class RepositoryAuthentificationAbstrait
  implements InterfaceRepositoryAuthentification
{
  constructor(protected readonly daoAuthentification: InterfaceDaoAuthentification) {}

  public async rechercherUtilisateurParIdentifiantOuEmail(
    identifiant: string
  ): Promise<EntiteUtilisateurAuthentification | null> {
    const donnees = await this.daoAuthentification.rechercherUtilisateurParIdentifiantOuEmail(
      identifiant
    )
    if (!donnees) return null
    return this.mapperUtilisateur(donnees)
  }

  public async creerSessionEtJetonRefresh(
    commande: TypeCommandeCreationSessionAuthentification
  ): Promise<void> {
    await this.daoAuthentification.creerSessionEtJetonRefresh({
      sessionId: commande.session.id,
      utilisateurId: commande.session.utilisateur.id,
      jetonAccesJti: commande.session.jetonAccesJti,
      jetonAccesExpireLe: commande.session.jetonAccesExpireLe,
      csrfToken: commande.session.csrfToken,
      adresseIp: commande.session.adresseIp,
      agentUtilisateur: commande.session.agentUtilisateur,
      expireLeSession: commande.session.expireLe,
      hachageJetonRefresh: commande.jetonRefresh.hachageToken,
      expireLeRefresh: commande.jetonRefresh.expireLe,
    })
  }

  public async rechercherSessionParIdAvecUtilisateur(
    sessionId: string
  ): Promise<EntiteSessionAuthentification | null> {
    const donnees = await this.daoAuthentification.rechercherSessionParIdAvecUtilisateur(sessionId)
    if (!donnees) return null
    return this.mapperSession(donnees)
  }

  public async rechercherJetonRefreshParHachageAvecSession(
    hachageToken: string
  ): Promise<EntiteJetonRefresh | null> {
    const donnees = await this.daoAuthentification.rechercherJetonRefreshParHachageAvecSession(
      hachageToken
    )
    if (!donnees) return null
    return this.mapperJetonRefresh(donnees)
  }

  public async revoquerJetonRefreshParId(
    jetonRefreshId: string,
    dateRevocation: Date
  ): Promise<void> {
    await this.daoAuthentification.revoquerJetonRefreshParId(jetonRefreshId, dateRevocation)
  }

  public async effectuerRotationJetonRefresh(
    commande: TypeCommandeRotationJetonRefreshAuthentification
  ): Promise<void> {
    await this.daoAuthentification.effectuerRotationJetonRefresh({
      sessionId: commande.session.id,
      jetonRefreshActuelId: commande.jetonRefreshActuelId,
      hachageNouveauJetonRefresh: commande.nouveauJetonRefresh.hachageToken,
      expireLeRefresh: commande.nouveauJetonRefresh.expireLe,
      nouveauJtiJetonAcces: commande.session.jetonAccesJti,
      expireLeJetonAcces: commande.session.jetonAccesExpireLe,
      nouveauCsrfToken: commande.session.csrfToken,
      adresseIp: commande.session.adresseIp,
      agentUtilisateur: commande.session.agentUtilisateur,
      dateRotation: commande.dateRotation,
    })
  }

  public async revoquerSessionEtJetonsRefresh(
    sessionId: string,
    dateRevocation: Date
  ): Promise<void> {
    await this.daoAuthentification.revoquerSessionEtJetonsRefresh(sessionId, dateRevocation)
  }

  public async activerTotpSuperAdmin(utilisateurId: string, secretChiffre: string): Promise<void> {
    await this.daoAuthentification.activerTotpSuperAdmin(utilisateurId, secretChiffre)
  }

  public async rechercherTotpSuperAdmin(
    utilisateurId: string
  ): Promise<TypeTotpSuperAdminAuthentification | null> {
    const totp = await this.daoAuthentification.rechercherTotpSuperAdmin(utilisateurId)
    if (!totp) return null
    return {
      id: totp.id,
      superAdminTotpActive: totp.superAdminTotpActive,
      superAdminTotpSecret: totp.superAdminTotpSecret,
    }
  }

  public async definirSecondeAuthSession(sessionId: string, dateValidation: Date): Promise<void> {
    await this.daoAuthentification.definirSecondeAuthSession(sessionId, dateValidation)
  }

  public async lireStatutTotpSuperAdmin(utilisateurId: string): Promise<boolean> {
    return this.daoAuthentification.lireStatutTotpSuperAdmin(utilisateurId)
  }

  public async listerAuditsSecurite(limite: number): Promise<EntiteAuditSecuriteAuthentification[]> {
    const audits = await this.daoAuthentification.listerAuditsSecurite(limite)
    return audits.map((audit) => this.mapperAuditSecurite(audit))
  }

  public async marquerCompromissionSessionEtRevoquerJetons(
    sessionId: string,
    dateCompromission: Date
  ): Promise<void> {
    await this.daoAuthentification.marquerCompromissionSessionEtRevoquerJetons(
      sessionId,
      dateCompromission
    )
  }

  public async listerTentativesEchecRecentes(
    identifiant: string,
    adresseIp: string,
    type: TypeTentativeConnexionAuthentification,
    dateDebutFenetre: Date,
    limite: number
  ): Promise<EntiteTentativeConnexion[]> {
    const tentatives = await this.daoAuthentification.listerTentativesEchecRecentes(
      identifiant,
      adresseIp,
      type,
      dateDebutFenetre,
      limite
    )

    return tentatives.map((tentative) => this.mapperTentativeConnexion(tentative))
  }

  public async enregistrerTentativeConnexion(entite: EntiteTentativeConnexion): Promise<void> {
    await this.daoAuthentification.enregistrerTentativeConnexion({
      id: entite.id,
      identifiant: entite.identifiant,
      adresseIp: entite.adresseIp,
      type: entite.type,
      succes: entite.succes,
      creeLe: entite.creeLe,
      utilisateurId: entite.utilisateurId || undefined,
    })
  }

  protected mapperUtilisateur(
    donnees: DonneesUtilisateurAuthentification
  ): EntiteUtilisateurAuthentification {
    const permissions = donnees.permissions.map((permission) =>
      new BuilderEntitePermissionUtilisateurAuth()
        .avecCode(permission.code)
        .avecAutorise(permission.autorise)
        .construire()
    )

    return new BuilderEntiteUtilisateurAuthentification()
      .avecId(donnees.id)
      .avecNomUtilisateur(donnees.nomUtilisateur)
      .avecEmail(donnees.email)
      .avecMotDePasseHache(donnees.motDePasseHache)
      .avecRole(donnees.role)
      .avecStatut(donnees.statut)
      .avecSuperAdminTotpActive(donnees.superAdminTotpActive)
      .avecSuperAdminTotpSecret(donnees.superAdminTotpSecret)
      .avecPermissions(permissions)
      .construire()
  }

  protected mapperSession(donnees: DonneesSessionAuthentification): EntiteSessionAuthentification {
    return new BuilderEntiteSessionAuthentification()
      .avecId(donnees.id)
      .avecUtilisateur(this.mapperUtilisateur(donnees.utilisateur))
      .avecJetonAccesJti(donnees.jetonAccesJti)
      .avecJetonAccesExpireLe(donnees.jetonAccesExpireLe)
      .avecCsrfToken(donnees.csrfToken)
      .avecAdresseIp(donnees.adresseIp)
      .avecAgentUtilisateur(donnees.agentUtilisateur)
      .avecSecondeAuthValideeLe(donnees.secondeAuthValideeLe)
      .avecExpireLe(donnees.expireLe)
      .avecRevoqueeLe(donnees.revoqueeLe)
      .avecCompromissionDetecteeLe(donnees.compromissionDetecteeLe)
      .construire()
  }

  protected mapperJetonRefresh(
    donnees: DonneesJetonRefreshAuthentification
  ): EntiteJetonRefresh {
    return new BuilderEntiteJetonRefresh()
      .avecId(donnees.id)
      .avecSessionId(donnees.sessionId)
      .avecHachageToken(donnees.hachageToken)
      .avecExpireLe(donnees.expireLe)
      .avecUtiliseLe(donnees.utiliseLe)
      .avecRevoqueLe(donnees.revoqueLe)
      .avecRemplaceParId(donnees.remplaceParId)
      .avecSession(this.mapperSession(donnees.session))
      .construire()
  }

  protected mapperTentativeConnexion(
    donnees: DonneesTentativeConnexion
  ): EntiteTentativeConnexion {
    return new BuilderEntiteTentativeConnexion()
      .avecId(donnees.id)
      .avecIdentifiant(donnees.identifiant)
      .avecAdresseIp(donnees.adresseIp)
      .avecType(donnees.type)
      .avecSucces(donnees.succes)
      .avecDateCreation(donnees.creeLe)
      .avecUtilisateurId(donnees.utilisateurId)
      .construire()
  }

  protected mapperAuditSecurite(
    donnees: DonneesAuditSecurite
  ): EntiteAuditSecuriteAuthentification {
    return new BuilderEntiteAuditSecuriteAuthentification()
      .avecId(donnees.id)
      .avecAction(donnees.action)
      .avecStatut(donnees.statut)
      .avecDetails(donnees.details)
      .avecAdresseIp(donnees.adresseIp)
      .avecAgentUtilisateur(donnees.agentUtilisateur)
      .avecDateCreation(donnees.creeLe)
      .avecUtilisateurId(donnees.utilisateurId)
      .construire()
  }
}
