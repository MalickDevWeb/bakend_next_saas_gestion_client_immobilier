import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { EntiteDemandeAdmin } from '@/src/domaine/entites/administration/EntiteDemandeAdmin'
import type { TypeDependancesServiceAdministrationAdminSupervision } from '@/src/application/types/administration/supervision/TypeDependancesServiceAdministrationAdminSupervision'
import { ServiceAdministrationAdminUtilitaires } from '@/src/application/services/administration/commun/ServiceAdministrationAdminUtilitaires'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

type TypeDependancesSupervisionDemandes = Pick<
  TypeDependancesServiceAdministrationAdminSupervision,
  'securite' | 'annulation' | 'daoDemandeAdmin' | 'constructeur' | 'mappeur' | 'serviceHachageMotDePasse'
>

export class ServiceAdministrationAdminSupervisionDemandes {
  constructor(private readonly dependances: TypeDependancesSupervisionDemandes) {}

  public async listerDemandesAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ): Promise<Record<string, unknown>[]> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admin_requests')
    const elements = (await this.dependances.daoDemandeAdmin.lister()).map((demande) =>
      this.dependances.mappeur.mapperDemandeAdminEnDto(demande)
    )
    return ServiceAdministrationAdminUtilitaires.trierElements(elements, champTri, ordreTri)
  }

  public async obtenirDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    demandeId: string
  ): Promise<Record<string, unknown>> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admin_requests')
    const demande = await this.dependances.daoDemandeAdmin.rechercherParId(demandeId)
    this.exigerEntite(demande, t(ERRORS.ADMIN_DEMANDE_ADMIN_INTROUVABLE))
    return this.dependances.mappeur.mapperDemandeAdminEnDto(demande)
  }

  public async creerDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admin_requests')
    const entite = this.dependances.constructeur.construireEntiteDemandeAdminDepuisCorps(corps)
    await this.dependances.daoDemandeAdmin.sauvegarder(entite)
    const dto = this.dependances.mappeur.mapperDemandeAdminEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'admin_requests',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/admin_requests/${entite.id}`,
      executerRollback: async () => this.dependances.daoDemandeAdmin.supprimerParId(entite.id),
    })
    return { donnees: dto, annulation }
  }

  public async creerDemandeAdminPublique(
    corps: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const entite = this.dependances.constructeur.construireEntiteDemandeAdminDepuisCorps(corps)
    await this.dependances.daoDemandeAdmin.sauvegarder(entite)
    return this.dependances.mappeur.mapperDemandeAdminEnDto(entite)
  }

  public async mettreAJourDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    demandeId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admin_requests')
    const existant = await this.dependances.daoDemandeAdmin.rechercherParId(demandeId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_DEMANDE_ADMIN_INTROUVABLE))
    const avantEntite = existant
    const fusion = { ...this.dependances.mappeur.mapperDemandeAdminEnDto(existant), ...corps, id: demandeId }
    const entite = this.dependances.constructeur.construireEntiteDemandeAdminDepuisCorps(fusion, demandeId)
    await this.dependances.daoDemandeAdmin.sauvegarder(entite)
    const dto = this.dependances.mappeur.mapperDemandeAdminEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'admin_requests',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/admin_requests/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoDemandeAdmin.sauvegarder(avantEntite)
      },
    })
    return { donnees: dto, annulation }
  }

  public async supprimerDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    demandeId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admin_requests')
    const existant = await this.dependances.daoDemandeAdmin.rechercherParId(demandeId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_DEMANDE_ADMIN_INTROUVABLE))
    const avantEntite = existant
    await this.dependances.daoDemandeAdmin.supprimerParId(demandeId)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'admin_requests',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: demandeId,
      path: `/admin_requests/${demandeId}`,
      executerRollback: async () => {
        await this.dependances.daoDemandeAdmin.sauvegarder(avantEntite)
      },
    })
    return { donnees: { ok: true }, annulation }
  }

  public async verifierDemandeAdminEnAttente(
    identifiant: string,
    motDePasse: string
  ): Promise<boolean> {
    const identifiantNormalise = this.normaliserTexte(identifiant)
    const motDePasseClair = String(motDePasse || '').trim()
    if (!identifiantNormalise || !motDePasseClair) return false

    const identifiantDigits = this.normaliserTelephone(identifiant)
    const elements = await this.dependances.daoDemandeAdmin.lister()

    for (const demande of elements) {
      if (String(demande.statut || '').toUpperCase() !== 'EN_ATTENTE') continue
      if (!this.correspondIdentifiant(demande, identifiantNormalise, identifiantDigits)) continue
      if (await this.verifierMotDePasseDemande(demande, motDePasseClair)) return true
    }

    return false
  }

  private normaliserTexte(valeur: unknown): string {
    return String(valeur || '').trim().toLowerCase()
  }

  private normaliserTelephone(valeur: unknown): string {
    return String(valeur || '').replace(/\D/g, '')
  }

  private correspondIdentifiant(
    demande: EntiteDemandeAdmin,
    identifiantNormalise: string,
    identifiantDigits: string
  ): boolean {
    const email = this.normaliserTexte(demande.email)
    const username = this.normaliserTexte(demande.nomUtilisateur)
    const identifiant = this.normaliserTexte(demande.id)
    if (email && identifiantNormalise === email) return true
    if (username && identifiantNormalise === username) return true
    if (identifiant && identifiantNormalise === identifiant) return true

    const telephone = this.normaliserTelephone(demande.telephone)
    if (telephone && identifiantDigits && telephone === identifiantDigits) return true
    return false
  }

  private async verifierMotDePasseDemande(
    demande: EntiteDemandeAdmin,
    motDePasseClair: string
  ): Promise<boolean> {
    const motDePasseStocke = String(demande.motDePasse || '').trim()
    if (!motDePasseStocke) return false
    if (motDePasseStocke === motDePasseClair) return true

    try {
      return await this.dependances.serviceHachageMotDePasse.verifier(
        motDePasseClair,
        motDePasseStocke
      )
    } catch {
      return false
    }
  }

  private exigerEntite<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }
}
