import { InterfaceValidateurAuthentification } from '@/src/coeur/interfaces/InterfaceValidateurAuthentification'

export class ValidateurAuthentification {
  constructor(
    private readonly validateurInfrastructure: InterfaceValidateurAuthentification
  ) {}

  public validerConnexion(entree: unknown) {
    return this.validateurInfrastructure.parserConnexion(entree)
  }

  public validerSecondeAuth(entree: unknown) {
    return this.validateurInfrastructure.parserSecondeAuthentification(entree)
  }

  public validerActivationTotp(entree: unknown) {
    return this.validateurInfrastructure.parserActivationTotp(entree)
  }

  public validerImpersonation(entree: unknown) {
    return this.validateurInfrastructure.parserImpersonation(entree)
  }

  public validerLimiteAudit(entree: unknown): number {
    return this.validateurInfrastructure.parserLimiteAudit(entree, 100)
  }
}
