import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { ServiceAdministrationAdminImports } from '@/src/application/services/administration/travaux/ServiceAdministrationAdminImports'
import { ServiceAdministrationAdminParametres } from '@/src/application/services/administration/travaux/ServiceAdministrationAdminParametres'
import type { TypeDependancesServiceAdministrationAdminTravauxParametresImports } from '@/src/application/types/administration/travaux/TypeDependancesServiceAdministrationAdminTravauxParametresImports'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

export class ServiceAdministrationAdminTravauxParametresImports {
  private readonly serviceImports: ServiceAdministrationAdminImports
  private readonly serviceParametres: ServiceAdministrationAdminParametres

  constructor(private readonly dependances: TypeDependancesServiceAdministrationAdminTravauxParametresImports) {
    this.serviceImports = new ServiceAdministrationAdminImports({
      securite: dependances.securite,
      annulation: dependances.annulation,
      daoExecutionImport: dependances.daoExecutionImport,
      constructeur: dependances.constructeur,
      mappeur: dependances.mappeur,
    })
    this.serviceParametres = new ServiceAdministrationAdminParametres({
      securite: dependances.securite,
      annulation: dependances.annulation,
      daoParametreAdmin: dependances.daoParametreAdmin,
    })
  }

  public async listerTravaux(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'work_items')
    return (await this.dependances.daoItemTravail.lister()).map((item) =>
      this.dependances.mappeur.mapperTravailEnDto(item)
    )
  }

  public async obtenirTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    travailId: string
  ): Promise<Record<string, unknown>> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'work_items')
    const travail = await this.dependances.daoItemTravail.rechercherParId(travailId)
    this.exigerEntite(travail, t(ERRORS.ADMIN_TRAVAIL_INTROUVABLE))
    return this.dependances.mappeur.mapperTravailEnDto(travail)
  }

  public async creerTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'work_items')
    const entite = this.dependances.constructeur.construireEntiteTravailDepuisCorps(corps)
    await this.dependances.daoItemTravail.sauvegarder(entite)

    const dto = this.dependances.mappeur.mapperTravailEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'work_items',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/work_items/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoItemTravail.supprimerParId(entite.id)
      },
    })

    return { donnees: dto, annulation }
  }

  public async mettreAJourTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    travailId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'work_items')
    const existant = await this.dependances.daoItemTravail.rechercherParId(travailId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_TRAVAIL_INTROUVABLE))

    const avantEntite = existant
    const fusion = { ...this.dependances.mappeur.mapperTravailEnDto(existant), ...corps, id: travailId }
    const entite = this.dependances.constructeur.construireEntiteTravailDepuisCorps(fusion, travailId)
    await this.dependances.daoItemTravail.sauvegarder(entite)

    const dto = this.dependances.mappeur.mapperTravailEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'work_items',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/work_items/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoItemTravail.sauvegarder(avantEntite)
      },
    })

    return { donnees: dto, annulation }
  }

  public async supprimerTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    travailId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'work_items')
    const existant = await this.dependances.daoItemTravail.rechercherParId(travailId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_TRAVAIL_INTROUVABLE))

    const avantEntite = existant
    await this.dependances.daoItemTravail.supprimerParId(travailId)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'work_items',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: travailId,
      path: `/work_items/${travailId}`,
      executerRollback: async () => {
        await this.dependances.daoItemTravail.sauvegarder(avantEntite)
      },
    })

    return { donnees: { ok: true }, annulation }
  }

  public listerParametres(jetonAcces: string, impersonation: DtoEtatImpersonation, cle?: string | null) {
    return this.serviceParametres.listerParametres(jetonAcces, impersonation, cle)
  }

  public creerParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceParametres.creerParametre(jetonAcces, impersonation, corps)
  }

  public mettreAJourParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    parametreId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceParametres.mettreAJourParametre(
      jetonAcces,
      impersonation,
      parametreId,
      corps
    )
  }

  public supprimerParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    parametreId: string
  ) {
    return this.serviceParametres.supprimerParametre(jetonAcces, impersonation, parametreId)
  }

  public listerImports(jetonAcces: string, impersonation: DtoEtatImpersonation) {
    return this.serviceImports.listerImports(jetonAcces, impersonation)
  }

  public obtenirImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    importId: string
  ) {
    return this.serviceImports.obtenirImport(jetonAcces, impersonation, importId)
  }

  public creerImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceImports.creerImport(jetonAcces, impersonation, corps)
  }

  public mettreAJourImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    importId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceImports.mettreAJourImport(jetonAcces, impersonation, importId, corps)
  }

  private exigerEntite<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }
}
