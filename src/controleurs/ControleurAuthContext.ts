import { ServiceAuthentification } from '@/src/application/services/authentification/ServiceAuthentification'
import { ValidateurAuthentification } from '@/src/application/validateurs/ValidateurAuthentification'
import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { TypeContexteRequeteAuthentification } from '@/src/domaine/types/authentification/TypeContexteRequeteAuthentification'

export class ControleurAuthContext {
  constructor(
    private readonly serviceAuthentification: ServiceAuthentification,
    private readonly validateurAuthentification: ValidateurAuthentification
  ) {}

  public async connexion(entree: unknown, contexte: TypeContexteRequeteAuthentification) {
    const valide = this.validateurAuthentification.validerConnexion(entree)
    return this.serviceAuthentification.connexion(
      valide.identifiant,
      valide.motDePasse,
      contexte
    )
  }

  public async contexte(jetonAcces: string) {
    const contexte = await this.serviceAuthentification.obtenirContexteDepuisJetonAcces(jetonAcces)
    return { user: contexte.utilisateur }
  }

  public async rafraichir(
    jetonRefresh: string,
    contexte: TypeContexteRequeteAuthentification
  ) {
    return this.serviceAuthentification.rafraichirSession(jetonRefresh, contexte)
  }

  public async deconnexion(
    jetonAcces: string | null,
    contexte: TypeContexteRequeteAuthentification
  ) {
    await this.serviceAuthentification.deconnexion(jetonAcces, contexte)
    return { ok: true }
  }

  public async verifierSecondeAuthSuperAdmin(
    jetonAcces: string,
    entree: unknown,
    contexte: TypeContexteRequeteAuthentification
  ) {
    const valide = this.validateurAuthentification.validerSecondeAuth(entree)
    return this.serviceAuthentification.verifierSecondeAuthSuperAdmin(
      jetonAcces,
      valide.identifiant || null,
      valide.codeTotp || null,
      valide.motDePasse || null,
      contexte
    )
  }

  public async initialiserTotpSuperAdmin(jetonAcces: string) {
    return this.serviceAuthentification.initialiserTotpSuperAdmin(jetonAcces)
  }

  public async activerTotpSuperAdmin(
    jetonAcces: string,
    entree: unknown,
    contexte: TypeContexteRequeteAuthentification
  ) {
    const valide = this.validateurAuthentification.validerActivationTotp(entree)
    return this.serviceAuthentification.activerTotpSuperAdmin(
      jetonAcces,
      valide.secretTemporaire,
      valide.codeTotp,
      contexte
    )
  }

  public async statutTotpSuperAdmin(jetonAcces: string) {
    return this.serviceAuthentification.obtenirStatutTotpSuperAdmin(jetonAcces)
  }

  public async listerAuditsSecurite(jetonAcces: string, limiteBrute: unknown) {
    const limite = this.validateurAuthentification.validerLimiteAudit(limiteBrute)
    return this.serviceAuthentification.listerAuditsSecurite(jetonAcces, limite)
  }

  public async definirImpersonation(
    jetonAcces: string,
    entree: unknown
  ): Promise<DtoEtatImpersonation> {
    const valide = this.validateurAuthentification.validerImpersonation(entree)
    return this.serviceAuthentification.definirImpersonation(
      jetonAcces,
      valide.adminId,
      valide.adminName,
      valide.userId
    )
  }

  public async effacerImpersonation(jetonAcces: string): Promise<void> {
    await this.serviceAuthentification.effacerImpersonation(jetonAcces)
  }
}
