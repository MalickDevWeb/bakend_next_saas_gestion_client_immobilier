import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { ExceptionAuthentificationAutorisation, ExceptionAuthentificationValidation } from '@/src/application/exceptions'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { EntiteClient, EntiteLocation } from '@/src/domaine/entites'
import { ServiceAdministrationAdminUtilitaires } from '@/src/application/services/administration/commun/ServiceAdministrationAdminUtilitaires'
import type { TypeDependancesServiceAdministrationAdminLocations } from '@/src/application/types/administration/clients/TypeDependancesServiceAdministrationAdminLocations'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

export class ServiceAdministrationAdminLocations {
  constructor(private readonly dependances: TypeDependancesServiceAdministrationAdminLocations) {}

  public async listerLocations(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ): Promise<Record<string, unknown>[]> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'locations')
    const elements = (await this.dependances.daoClient.lister())
      .filter((client) => this.estClientVisibleParAdmin(client, contexte.adminId))
      .flatMap((client) =>
        client.locations.map((location) => this.dependances.mappeur.mapperLocationEnDto(location, client))
      )

    return ServiceAdministrationAdminUtilitaires.trierElements(elements, champTri, ordreTri)
  }

  public async obtenirLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    locationId: string
  ): Promise<Record<string, unknown>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'locations')
    const resultat = await this.rechercherClientEtLocationParId(locationId, contexte.adminId)
    this.exigerEntite(resultat, t(ERRORS.ADMIN_LOCATION_INTROUVABLE))
    return this.dependances.mappeur.mapperLocationEnDto(resultat.location, resultat.client)
  }

  public async creerLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'locations')
    const clientId = String(corps.clientId || '').trim()
    if (!clientId) {
      throw new ExceptionAuthentificationValidation(t(ERRORS.PARAMETRES_INVALIDES), { champ: 'clientId' })
    }

    const client = await this.dependances.daoClient.rechercherParId(clientId)
    this.exigerEntite(client, t(ERRORS.ADMIN_CLIENT_INTROUVABLE))

    if (!this.estClientVisibleParAdmin(client, contexte.adminId)) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    const location = this.dependances.constructeur.construireEntiteLocationDepuisCorps(corps, client.id)
    client.locations = [...client.locations.filter((item) => item.id !== location.id), location]
    await this.dependances.daoClient.sauvegarder(client)

    const dto = this.dependances.mappeur.mapperLocationEnDto(location, client)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'locations',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: location.id,
      path: `/locations/${location.id}`,
      executerRollback: async () => {
        const clientActuel = await this.dependances.daoClient.rechercherParId(client.id)
        if (!clientActuel) return
        clientActuel.locations = clientActuel.locations.filter((item) => item.id !== location.id)
        await this.dependances.daoClient.sauvegarder(clientActuel)
      },
    })

    return { donnees: dto, annulation }
  }

  public async mettreAJourLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    locationId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'locations')
    const existant = await this.rechercherClientEtLocationParId(locationId, contexte.adminId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_LOCATION_INTROUVABLE))

    const avantEntite = existant.location
    const fusion = ServiceAdministrationAdminUtilitaires.versObjet({
      ...this.dependances.mappeur.mapperLocationEnDto(existant.location, existant.client),
      ...corps,
      id: locationId,
      clientId: existant.client.id,
    })
    const location = this.dependances.constructeur.construireEntiteLocationDepuisCorps(
      fusion,
      existant.client.id
    )
    existant.client.locations = [
      ...existant.client.locations.filter((item) => item.id !== locationId),
      location,
    ]
    await this.dependances.daoClient.sauvegarder(existant.client)

    const dto = this.dependances.mappeur.mapperLocationEnDto(location, existant.client)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'locations',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: location.id,
      path: `/locations/${location.id}`,
      executerRollback: async () => {
        const clientActuel = await this.dependances.daoClient.rechercherParId(existant.client.id)
        if (!clientActuel) return
        clientActuel.locations = [
          ...clientActuel.locations.filter((item) => item.id !== locationId),
          avantEntite,
        ]
        await this.dependances.daoClient.sauvegarder(clientActuel)
      },
    })

    return { donnees: dto, annulation }
  }

  public async supprimerLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    locationId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'locations')
    const existant = await this.rechercherClientEtLocationParId(locationId, contexte.adminId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_LOCATION_INTROUVABLE))

    const avantEntite = existant.location
    existant.client.locations = existant.client.locations.filter((item) => item.id !== locationId)
    await this.dependances.daoClient.sauvegarder(existant.client)

    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'locations',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: locationId,
      path: `/locations/${locationId}`,
      executerRollback: async () => {
        const clientActuel = await this.dependances.daoClient.rechercherParId(existant.client.id)
        if (!clientActuel) return
        clientActuel.locations = [
          ...clientActuel.locations.filter((item) => item.id !== locationId),
          avantEntite,
        ]
        await this.dependances.daoClient.sauvegarder(clientActuel)
      },
    })

    return { donnees: { ok: true }, annulation }
  }

  private estClientVisibleParAdmin(client: EntiteClient, adminId: string): boolean {
    return String(client.adminId || '').trim() === String(adminId || '').trim()
  }

  private async rechercherClientEtLocationParId(
    locationId: string,
    adminId: string
  ): Promise<{ client: EntiteClient; location: EntiteLocation } | null> {
    const clients = await this.dependances.daoClient.lister()
    for (const client of clients) {
      if (!this.estClientVisibleParAdmin(client, adminId)) continue
      const location = client.locations.find((item) => item.id === locationId)
      if (!location) continue
      return { client, location }
    }
    return null
  }

  private exigerEntite<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }
}
