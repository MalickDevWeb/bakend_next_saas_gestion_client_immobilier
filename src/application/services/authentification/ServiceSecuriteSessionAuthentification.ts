import { BuilderEntiteTentativeConnexion } from '@/src/domaine/builders/authentification/BuilderEntiteTentativeConnexion'
import { ConfigurationSecurite } from '@/src/coeur/configuration/ConfigurationSecurite'
import { InterfaceServiceAuditSecurite } from '@/src/coeur/interfaces/InterfaceServiceAuditSecurite'
import { InterfaceRepositoryAuthentification } from '@/src/domaine/interfaces/repository/InterfaceRepositoryAuthentification'
import { TypeTentativeConnexionAuthentification } from '@/src/domaine/types/authentification/TypeTentativeConnexionAuthentification'
import { TypeContexteRequeteAuthentification } from '@/src/domaine/types/authentification/TypeContexteRequeteAuthentification'
import { t } from '@/src/messages'
import { ERRORS } from '@/src/messages/app/errors'
import { ExceptionAuthentificationLimiteTentatives } from '@/src/application/exceptions'

export class ServiceSecuriteSessionAuthentification {
  constructor(
    private readonly repositoryAuthentification: InterfaceRepositoryAuthentification,
    private readonly configurationSecurite: ConfigurationSecurite,
    private readonly serviceAudit: InterfaceServiceAuditSecurite
  ) {}

  public async verifierBlocage(
    identifiant: string,
    adresseIp: string,
    type: TypeTentativeConnexionAuthentification
  ): Promise<void> {
    const limite = this.configurationSecurite.limiteEchecsConnexion()
    const fenetre = this.configurationSecurite.fenetreEchecsSecondes()
    const dureeBlocage = this.configurationSecurite.dureeBlocageSecondes()
    const maintenant = Date.now()
    const dateDebutFenetre = new Date(maintenant - fenetre * 1000)

    const echecs = await this.repositoryAuthentification.listerTentativesEchecRecentes(
      identifiant,
      adresseIp,
      type,
      dateDebutFenetre,
      limite
    )

    // Politique anti brute-force: si la limite est atteinte dans la fenetre, blocage temporaire.
    if (echecs.length < limite) return

    const derniereTentative = echecs[0]
    const bloqueJusqua = new Date(derniereTentative.creeLe.getTime() + dureeBlocage * 1000)
    if (bloqueJusqua.getTime() <= maintenant) return

    await this.serviceAudit.enregistrer({
      action: 'AUTH_LOCKED',
      statut: 'ALERTE',
      details: `Blocage actif jusqu a ${bloqueJusqua.toISOString()} (${type})`,
      adresseIp,
    })

    throw new ExceptionAuthentificationLimiteTentatives(t(ERRORS.AUTH_TROP_DE_TENTATIVES), {
      bloqueJusqua: bloqueJusqua.toISOString(),
    })
  }

  public async enregistrerTentative(
    identifiant: string,
    adresseIp: string,
    type: TypeTentativeConnexionAuthentification,
    succes: boolean,
    utilisateurId?: string
  ): Promise<void> {
    const tentative = new BuilderEntiteTentativeConnexion()
      .avecIdentifiant(identifiant)
      .avecAdresseIp(adresseIp)
      .avecType(type)
      .avecSucces(succes)
      .avecUtilisateurId(utilisateurId || null)
      .construire()
    await this.repositoryAuthentification.enregistrerTentativeConnexion(tentative)
  }

  public async signalerReutilisationRefresh(
    sessionId: string,
    utilisateurId: string,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<void> {
    const maintenant = new Date()
    await this.repositoryAuthentification.marquerCompromissionSessionEtRevoquerJetons(
      sessionId,
      maintenant
    )

    await this.serviceAudit.enregistrer({
      utilisateurId,
      action: 'AUTH_REFRESH_REUSE_DETECTED',
      statut: 'ALERTE',
      details: 'Reutilisation d un refresh token detectee',
      adresseIp: contexte.adresseIp,
      agentUtilisateur: contexte.agentUtilisateur,
    })
  }
}
