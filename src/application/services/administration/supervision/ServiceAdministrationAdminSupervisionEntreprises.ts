import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import type { TypeDependancesServiceAdministrationAdminSupervision } from '@/src/application/types/administration/supervision/TypeDependancesServiceAdministrationAdminSupervision'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

type TypeDependancesSupervisionEntreprises = Pick<
  TypeDependancesServiceAdministrationAdminSupervision,
  'securite' | 'annulation' | 'daoEntreprise' | 'constructeur' | 'mappeur'
>

export class ServiceAdministrationAdminSupervisionEntreprises {
  constructor(private readonly dependances: TypeDependancesSupervisionEntreprises) {}

  public async listerEntreprises(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'entreprises')
    return (await this.dependances.daoEntreprise.lister()).map((entreprise) =>
      this.dependances.mappeur.mapperEntrepriseEnDto(entreprise)
    )
  }

  public async obtenirEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    entrepriseId: string
  ): Promise<Record<string, unknown>> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'entreprises')
    const entreprise = await this.dependances.daoEntreprise.rechercherParId(entrepriseId)
    this.exigerEntite(entreprise, t(ERRORS.ADMIN_ENTREPRISE_INTROUVABLE))
    return this.dependances.mappeur.mapperEntrepriseEnDto(entreprise)
  }

  public async creerEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'entreprises')
    const entite = this.dependances.constructeur.construireEntiteEntrepriseDepuisCorps(corps)
    await this.dependances.daoEntreprise.sauvegarder(entite)
    const dto = this.dependances.mappeur.mapperEntrepriseEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'entreprises',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/entreprises/${entite.id}`,
      executerRollback: async () => this.dependances.daoEntreprise.supprimerParId(entite.id),
    })
    return { donnees: dto, annulation }
  }

  public async mettreAJourEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    entrepriseId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'entreprises')
    const existant = await this.dependances.daoEntreprise.rechercherParId(entrepriseId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_ENTREPRISE_INTROUVABLE))
    const avantEntite = existant
    const fusion = { ...this.dependances.mappeur.mapperEntrepriseEnDto(existant), ...corps, id: entrepriseId }
    const entite = this.dependances.constructeur.construireEntiteEntrepriseDepuisCorps(fusion, entrepriseId)
    await this.dependances.daoEntreprise.sauvegarder(entite)
    const dto = this.dependances.mappeur.mapperEntrepriseEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'entreprises',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/entreprises/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoEntreprise.sauvegarder(avantEntite)
      },
    })
    return { donnees: dto, annulation }
  }

  public async supprimerEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    entrepriseId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'entreprises')
    const existant = await this.dependances.daoEntreprise.rechercherParId(entrepriseId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_ENTREPRISE_INTROUVABLE))
    const avantEntite = existant
    await this.dependances.daoEntreprise.supprimerParId(entrepriseId)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'entreprises',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: entrepriseId,
      path: `/entreprises/${entrepriseId}`,
      executerRollback: async () => {
        await this.dependances.daoEntreprise.sauvegarder(avantEntite)
      },
    })
    return { donnees: { ok: true }, annulation }
  }

  private exigerEntite<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }
}
