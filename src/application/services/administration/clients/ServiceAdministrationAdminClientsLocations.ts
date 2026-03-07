import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { ExceptionAuthentificationAutorisation } from '@/src/application/exceptions'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { EntiteClient } from '@/src/domaine/entites'
import { ServiceAdministrationAdminLocations } from '@/src/application/services/administration/clients/ServiceAdministrationAdminLocations'
import { ServiceAdministrationAdminUtilitaires } from '@/src/application/services/administration/commun/ServiceAdministrationAdminUtilitaires'
import type { TypeDependancesServiceAdministrationAdminClientsLocations } from '@/src/application/types/administration/clients/TypeDependancesServiceAdministrationAdminClientsLocations'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

export class ServiceAdministrationAdminClientsLocations {
  private readonly serviceLocations: ServiceAdministrationAdminLocations

  constructor(private readonly dependances: TypeDependancesServiceAdministrationAdminClientsLocations) {
    this.serviceLocations = new ServiceAdministrationAdminLocations(dependances)
  }

  public async listerClients(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ): Promise<Record<string, unknown>[]> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'clients')
    const clients = (await this.dependances.daoClient.lister(contexte.adminId))
      .map((client) => this.dependances.mappeur.mapperClientEnDto(client))

    return ServiceAdministrationAdminUtilitaires.trierElements(clients, champTri, ordreTri)
  }

  public async obtenirClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    clientId: string
  ): Promise<Record<string, unknown>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'clients')
    const client = await this.dependances.daoClient.rechercherParId(clientId)
    this.exigerEntite(client, t(ERRORS.ADMIN_CLIENT_INTROUVABLE))

    if (!this.estClientVisibleParAdmin(client, contexte.adminId)) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    return this.dependances.mappeur.mapperClientEnDto(client)
  }

  public async creerClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'clients')
    const entite = this.dependances.constructeur.construireEntiteClientDepuisCorps(corps, contexte.adminId)
    await this.verifierDoublonClientParAdmin(entite, contexte.adminId)
    await this.dependances.daoClient.sauvegarder(entite)

    const dto = this.dependances.mappeur.mapperClientEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'clients',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/clients/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoClient.supprimerParId(entite.id)
      },
    })

    return { donnees: dto, annulation }
  }

  public async mettreAJourClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    clientId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'clients')
    const existant = await this.dependances.daoClient.rechercherParId(clientId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_CLIENT_INTROUVABLE))

    if (!this.estClientVisibleParAdmin(existant, contexte.adminId)) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    const avantEntite = existant
    const fusion = {
      ...this.dependances.mappeur.mapperClientEnDto(existant),
      ...corps,
      id: clientId,
      adminId: contexte.adminId,
    }

    const entite = this.dependances.constructeur.construireEntiteClientDepuisCorps(
      fusion,
      contexte.adminId,
      clientId
    )
    await this.verifierDoublonClientParAdmin(entite, contexte.adminId, clientId)
    await this.dependances.daoClient.sauvegarder(entite)

    const dto = this.dependances.mappeur.mapperClientEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'clients',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/clients/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoClient.sauvegarder(avantEntite)
      },
    })

    return { donnees: dto, annulation }
  }

  public async supprimerClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    clientId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'clients')
    const existant = await this.dependances.daoClient.rechercherParId(clientId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_CLIENT_INTROUVABLE))

    if (!this.estClientVisibleParAdmin(existant, contexte.adminId)) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    const avantEntite = existant
    await this.dependances.daoClient.supprimerParId(clientId)

    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'clients',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: clientId,
      path: `/clients/${clientId}`,
      executerRollback: async () => {
        await this.dependances.daoClient.sauvegarder(avantEntite)
      },
    })

    return { donnees: { ok: true }, annulation }
  }

  public listerLocations(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ) {
    return this.serviceLocations.listerLocations(jetonAcces, impersonation, champTri, ordreTri)
  }

  public obtenirLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    locationId: string
  ) {
    return this.serviceLocations.obtenirLocation(jetonAcces, impersonation, locationId)
  }

  public creerLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ) {
    return this.serviceLocations.creerLocation(jetonAcces, impersonation, corps)
  }

  public mettreAJourLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    locationId: string,
    corps: Record<string, unknown>
  ) {
    return this.serviceLocations.mettreAJourLocation(
      jetonAcces,
      impersonation,
      locationId,
      corps
    )
  }

  public supprimerLocation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    locationId: string
  ) {
    return this.serviceLocations.supprimerLocation(jetonAcces, impersonation, locationId)
  }

  private estClientVisibleParAdmin(client: EntiteClient, adminId: string): boolean {
    return String(client.adminId || '').trim() === String(adminId || '').trim()
  }

  private async verifierDoublonClientParAdmin(
    entite: EntiteClient,
    adminId: string,
    selfId?: string
  ): Promise<void> {
    const telephoneNormalise = this.normaliserTelephone(entite.telephone)
    const emailNormalise = this.normaliserTexte(entite.email)
    if (!telephoneNormalise && !emailNormalise) return

    const elements = await this.dependances.daoClient.lister(adminId)
    for (const client of elements) {
      if (selfId && String(client.id || '').trim() === String(selfId || '').trim()) continue

      const telephoneClient = this.normaliserTelephone(client.telephone)
      const emailClient = this.normaliserTexte(client.email)
      const conflitTelephone = Boolean(telephoneNormalise && telephoneClient && telephoneNormalise === telephoneClient)
      const conflitEmail = Boolean(emailNormalise && emailClient && emailNormalise === emailClient)
      if (conflitTelephone || conflitEmail) {
        throw new ErreurHttp(CODE_HTTP.CONFLIT, t(ERRORS.ADMIN_CLIENT_DUPLIQUE_PAR_ADMIN))
      }
    }
  }

  private normaliserTelephone(valeur: unknown): string {
    const digits = String(valeur || '').replace(/\D/g, '')
    if (digits.startsWith('221')) {
      return digits.slice(3)
    }
    return digits
  }

  private normaliserTexte(valeur: unknown): string {
    return String(valeur || '').trim().toLowerCase()
  }

  private exigerEntite<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }
}
