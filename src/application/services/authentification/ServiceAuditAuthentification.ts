import { DtoListeAuditsSecurite } from '@/src/application/dtos/authentification/DtoAuthentification'
import { InterfaceRepositoryAuthentification } from '@/src/domaine/interfaces/repository/InterfaceRepositoryAuthentification'
import { ServiceAutorisationAuthentification } from '@/src/application/services/authentification/ServiceAutorisationAuthentification'

export class ServiceAuditAuthentification {
  constructor(
    private readonly repositoryAuthentification: InterfaceRepositoryAuthentification,
    private readonly serviceAutorisationAuthentification: ServiceAutorisationAuthentification
  ) {}

  public async listerAuditsSecurite(
    jetonAcces: string,
    limite: number
  ): Promise<DtoListeAuditsSecurite> {
    await this.serviceAutorisationAuthentification.exigerSecondeAuthSuperAdmin(jetonAcces)
    await this.serviceAutorisationAuthentification.verifierPermission(jetonAcces, 'AUDIT_LIRE')

    const limiteProtegee = Math.max(1, Math.min(500, limite))
    const audits = await this.repositoryAuthentification.listerAuditsSecurite(limiteProtegee)

    return {
      elements: audits.map((audit) => ({
        id: audit.id,
        action: audit.action,
        statut: audit.statut,
        details: audit.details,
        adresseIp: audit.adresseIp,
        agentUtilisateur: audit.agentUtilisateur,
        creeLe: audit.creeLe,
        utilisateurId: audit.utilisateurId,
      })),
      total: audits.length,
    }
  }
}
