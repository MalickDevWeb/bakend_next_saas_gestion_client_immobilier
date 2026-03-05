import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import type { TypeDependancesServiceAdministrationAdminImports } from '@/src/application/types/administration/travaux/TypeDependancesServiceAdministrationAdminImports'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

export class ServiceAdministrationAdminImports {
  constructor(private readonly dependances: TypeDependancesServiceAdministrationAdminImports) {}

  public async listerImports(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'import_runs')
    return (await this.dependances.daoExecutionImport.lister()).map((element) =>
      this.dependances.mappeur.mapperExecutionImportEnDto(element)
    )
  }

  public async obtenirImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    importId: string
  ): Promise<Record<string, unknown>> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'import_runs')
    const execution = await this.dependances.daoExecutionImport.rechercherParId(importId)
    this.exigerEntite(execution, t(ERRORS.ADMIN_EXECUTION_IMPORT_INTROUVABLE))
    return this.dependances.mappeur.mapperExecutionImportEnDto(execution)
  }

  public async creerImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'import_runs')
    const entite = this.dependances.constructeur.construireEntiteImportDepuisCorps(corps, contexte.adminId)
    await this.dependances.daoExecutionImport.sauvegarder(entite)

    const dto = this.dependances.mappeur.mapperExecutionImportEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'import_runs',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/import_runs/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoExecutionImport.supprimerParId(entite.id)
      },
    })

    return { donnees: dto, annulation }
  }

  public async mettreAJourImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    importId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'import_runs')
    const existant = await this.dependances.daoExecutionImport.rechercherParId(importId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_EXECUTION_IMPORT_INTROUVABLE))

    const avantEntite = existant
    const avant = this.dependances.mappeur.mapperExecutionImportEnDto(existant)
    const fusion = { ...avant, ...corps, id: importId, adminId: avant.adminId || contexte.adminId }
    const entite = this.dependances.constructeur.construireEntiteImportDepuisCorps(
      fusion,
      String(fusion.adminId || contexte.adminId),
      importId
    )
    await this.dependances.daoExecutionImport.sauvegarder(entite)

    const dto = this.dependances.mappeur.mapperExecutionImportEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'import_runs',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/import_runs/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoExecutionImport.sauvegarder(avantEntite)
      },
    })

    return { donnees: dto, annulation }
  }

  private exigerEntite<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }
}
