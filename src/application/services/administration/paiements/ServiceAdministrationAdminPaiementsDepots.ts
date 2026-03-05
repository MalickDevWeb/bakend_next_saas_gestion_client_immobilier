import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import type { TypeDependancesServiceAdministrationAdminPaiementsDepots } from '@/src/application/types/administration/paiements/TypeDependancesServiceAdministrationAdminPaiementsDepots'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

export class ServiceAdministrationAdminPaiementsDepots {
  constructor(private readonly dependances: TypeDependancesServiceAdministrationAdminPaiementsDepots) {}

  public async listerPaiements(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'payments')
    return (await this.dependances.daoTransactionPaiement.lister()).map((element) =>
      this.dependances.mappeur.mapperPaiementEnDto(element)
    )
  }

  public async obtenirPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ): Promise<Record<string, unknown>> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'payments')
    const paiement = await this.dependances.daoTransactionPaiement.rechercherParId(paiementId)
    this.exigerEntite(paiement, t(ERRORS.ADMIN_PAIEMENT_INTROUVABLE))
    return this.dependances.mappeur.mapperPaiementEnDto(paiement)
  }

  public async creerPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'payments')
    const paiement = this.dependances.constructeurLocations.construireEntitePaiementDepuisCorps(corps)
    await this.dependances.daoTransactionPaiement.sauvegarder(paiement)
    this.dependances.statutsPaiement.set(
      paiement.id,
      this.dependances.constructeurSysteme.normaliserStatutMouvement(corps.status)
    )

    const dto = this.dependances.mappeur.mapperPaiementEnDto(paiement)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'payments',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: paiement.id,
      path: `/payments/${paiement.id}`,
      executerRollback: async () => {
        await this.dependances.daoTransactionPaiement.supprimerParId(paiement.id)
        this.dependances.statutsPaiement.delete(paiement.id)
      },
    })

    return { donnees: dto, annulation }
  }

  public async mettreAJourPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'payments')
    const existant = await this.dependances.daoTransactionPaiement.rechercherParId(paiementId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_PAIEMENT_INTROUVABLE))

    const avantEntite = existant
    const fusion = { ...this.dependances.mappeur.mapperPaiementEnDto(existant), ...corps, id: paiementId }
    const statutAvant = this.dependances.statutsPaiement.get(avantEntite.id) || 'completed'
    const paiement = this.dependances.constructeurLocations.construireEntitePaiementDepuisCorps(fusion, paiementId)
    await this.dependances.daoTransactionPaiement.sauvegarder(paiement)

    this.dependances.statutsPaiement.set(
      paiement.id,
      this.dependances.constructeurSysteme.normaliserStatutMouvement(
        (fusion as Record<string, unknown>).status
      )
    )

    const dto = this.dependances.mappeur.mapperPaiementEnDto(paiement)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'payments',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: paiement.id,
      path: `/payments/${paiement.id}`,
      executerRollback: async () => {
        await this.dependances.daoTransactionPaiement.sauvegarder(avantEntite)
        this.dependances.statutsPaiement.set(avantEntite.id, statutAvant)
      },
    })

    return { donnees: dto, annulation }
  }

  public async supprimerPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'payments')
    const existant = await this.dependances.daoTransactionPaiement.rechercherParId(paiementId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_PAIEMENT_INTROUVABLE))

    const avantEntite = existant
    const statutAvant = this.dependances.statutsPaiement.get(paiementId) || 'completed'
    await this.dependances.daoTransactionPaiement.supprimerParId(paiementId)
    this.dependances.statutsPaiement.delete(paiementId)

    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'payments',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: paiementId,
      path: `/payments/${paiementId}`,
      executerRollback: async () => {
        await this.dependances.daoTransactionPaiement.sauvegarder(avantEntite)
        this.dependances.statutsPaiement.set(avantEntite.id, statutAvant)
      },
    })

    return { donnees: { ok: true }, annulation }
  }

  public async listerDepots(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'deposits')
    return (await this.dependances.daoPaiementCaution.lister()).map((element) =>
      this.dependances.mappeur.mapperDepotEnDto(element)
    )
  }

  public async obtenirDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    depotId: string
  ): Promise<Record<string, unknown>> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'deposits')
    const depot = await this.dependances.daoPaiementCaution.rechercherParId(depotId)
    this.exigerEntite(depot, t(ERRORS.ADMIN_DEPOT_INTROUVABLE))
    return this.dependances.mappeur.mapperDepotEnDto(depot)
  }

  public async creerDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'deposits')
    const depot = this.dependances.constructeurLocations.construireEntiteDepotDepuisCorps(corps)
    await this.dependances.daoPaiementCaution.sauvegarder(depot)
    this.dependances.statutsDepot.set(
      depot.id,
      this.dependances.constructeurSysteme.normaliserStatutMouvement(corps.status)
    )

    const dto = this.dependances.mappeur.mapperDepotEnDto(depot)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'deposits',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: depot.id,
      path: `/deposits/${depot.id}`,
      executerRollback: async () => {
        await this.dependances.daoPaiementCaution.supprimerParId(depot.id)
        this.dependances.statutsDepot.delete(depot.id)
      },
    })

    return { donnees: dto, annulation }
  }

  public async mettreAJourDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    depotId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'deposits')
    const existant = await this.dependances.daoPaiementCaution.rechercherParId(depotId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_DEPOT_INTROUVABLE))

    const avantEntite = existant
    const fusion = { ...this.dependances.mappeur.mapperDepotEnDto(existant), ...corps, id: depotId }
    const statutAvant = this.dependances.statutsDepot.get(avantEntite.id) || 'completed'
    const depot = this.dependances.constructeurLocations.construireEntiteDepotDepuisCorps(fusion, depotId)
    await this.dependances.daoPaiementCaution.sauvegarder(depot)
    this.dependances.statutsDepot.set(
      depot.id,
      this.dependances.constructeurSysteme.normaliserStatutMouvement(
        (fusion as Record<string, unknown>).status
      )
    )

    const dto = this.dependances.mappeur.mapperDepotEnDto(depot)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'deposits',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: depot.id,
      path: `/deposits/${depot.id}`,
      executerRollback: async () => {
        await this.dependances.daoPaiementCaution.sauvegarder(avantEntite)
        this.dependances.statutsDepot.set(avantEntite.id, statutAvant)
      },
    })

    return { donnees: dto, annulation }
  }

  public async supprimerDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    depotId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'deposits')
    const existant = await this.dependances.daoPaiementCaution.rechercherParId(depotId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_DEPOT_INTROUVABLE))

    const avantEntite = existant
    const statutAvant = this.dependances.statutsDepot.get(depotId) || 'completed'
    await this.dependances.daoPaiementCaution.supprimerParId(depotId)
    this.dependances.statutsDepot.delete(depotId)

    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'deposits',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: depotId,
      path: `/deposits/${depotId}`,
      executerRollback: async () => {
        await this.dependances.daoPaiementCaution.sauvegarder(avantEntite)
        this.dependances.statutsDepot.set(avantEntite.id, statutAvant)
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
