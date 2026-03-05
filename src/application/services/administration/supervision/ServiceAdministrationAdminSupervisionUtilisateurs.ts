import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import type { TypeDependancesServiceAdministrationAdminSupervision } from '@/src/application/types/administration/supervision/TypeDependancesServiceAdministrationAdminSupervision'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

type TypeDependancesSupervisionUtilisateurs = Pick<
  TypeDependancesServiceAdministrationAdminSupervision,
  'securite' | 'annulation' | 'daoUtilisateur' | 'constructeur' | 'mappeur'
>

export class ServiceAdministrationAdminSupervisionUtilisateurs {
  constructor(private readonly dependances: TypeDependancesSupervisionUtilisateurs) {}

  public async listerUtilisateurs(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'users')
    return (await this.dependances.daoUtilisateur.lister()).map((utilisateur) =>
      this.dependances.mappeur.mapperUtilisateurEnDto(utilisateur)
    )
  }

  public async obtenirUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    utilisateurId: string
  ): Promise<Record<string, unknown>> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'users')
    const utilisateur = await this.dependances.daoUtilisateur.rechercherParId(utilisateurId)
    this.exigerEntite(utilisateur, t(ERRORS.ADMIN_UTILISATEUR_INTROUVABLE))
    return this.dependances.mappeur.mapperUtilisateurEnDto(utilisateur)
  }

  public async creerUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'users')
    const entite = this.dependances.constructeur.construireEntiteUtilisateurDepuisCorps(corps)
    await this.dependances.daoUtilisateur.sauvegarder(entite)
    const dto = this.dependances.mappeur.mapperUtilisateurEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'users',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/users/${entite.id}`,
      executerRollback: async () => this.dependances.daoUtilisateur.supprimerParId(entite.id),
    })
    return { donnees: dto, annulation }
  }

  public async mettreAJourUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    utilisateurId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'users')
    const existant = await this.dependances.daoUtilisateur.rechercherParId(utilisateurId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_UTILISATEUR_INTROUVABLE))
    const avantEntite = existant
    const fusion = {
      ...this.dependances.mappeur.mapperUtilisateurEnDto(existant),
      ...corps,
      id: utilisateurId,
    }
    const entite = this.dependances.constructeur.construireEntiteUtilisateurDepuisCorps(
      fusion,
      utilisateurId
    )
    await this.dependances.daoUtilisateur.sauvegarder(entite)
    const dto = this.dependances.mappeur.mapperUtilisateurEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'users',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/users/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoUtilisateur.sauvegarder(avantEntite)
      },
    })
    return { donnees: dto, annulation }
  }

  public async supprimerUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    utilisateurId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'users')
    const existant = await this.dependances.daoUtilisateur.rechercherParId(utilisateurId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_UTILISATEUR_INTROUVABLE))
    const avantEntite = existant
    await this.dependances.daoUtilisateur.supprimerParId(utilisateurId)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'users',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: utilisateurId,
      path: `/users/${utilisateurId}`,
      executerRollback: async () => {
        await this.dependances.daoUtilisateur.sauvegarder(avantEntite)
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
