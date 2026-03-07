import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { EntiteDemandeAdmin } from '@/src/domaine/entites/administration/EntiteDemandeAdmin'
import type { TypeDependancesServiceAdministrationAdminSupervision } from '@/src/application/types/administration/supervision/TypeDependancesServiceAdministrationAdminSupervision'
import { ServiceAdministrationAdminUtilitaires } from '@/src/application/services/administration/commun/ServiceAdministrationAdminUtilitaires'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

type TypeDependancesSupervisionDemandes = Pick<
  TypeDependancesServiceAdministrationAdminSupervision,
  | 'securite'
  | 'annulation'
  | 'daoDemandeAdmin'
  | 'constructeur'
  | 'mappeur'
  | 'serviceHachageMotDePasse'
  | 'serviceEvenementsNotification'
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
    const corpsPrepare = await this.preparerCorpsDemandeAdmin(corps)
    const entite = this.dependances.constructeur.construireEntiteDemandeAdminDepuisCorps(corpsPrepare)
    await this.dependances.daoDemandeAdmin.sauvegarder(entite)
    const dto = this.dependances.mappeur.mapperDemandeAdminEnDto(entite)
    this.publierEvenementDemandeAdminCreee(dto, contexte.utilisateurId ?? null)
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
    const corpsPrepare = await this.preparerCorpsDemandeAdmin(corps)
    const entite = this.dependances.constructeur.construireEntiteDemandeAdminDepuisCorps(corpsPrepare)
    await this.dependances.daoDemandeAdmin.sauvegarder(entite)
    const dto = this.dependances.mappeur.mapperDemandeAdminEnDto(entite)
    this.publierEvenementDemandeAdminCreee(dto, null)
    return dto
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
    const statutAvant = String(avantEntite.statut || '').toUpperCase()
    const fusion = { ...this.dependances.mappeur.mapperDemandeAdminEnDto(existant), ...corps, id: demandeId }
    const corpsPrepare = await this.preparerCorpsDemandeAdmin(fusion, existant.motDePasse || null)
    const entite = this.dependances.constructeur.construireEntiteDemandeAdminDepuisCorps(
      corpsPrepare,
      demandeId
    )
    await this.dependances.daoDemandeAdmin.sauvegarder(entite)
    const dto = this.dependances.mappeur.mapperDemandeAdminEnDto(entite)
    const statutApres = String(entite.statut || '').toUpperCase()
    if (statutAvant !== 'ACTIF' && statutApres === 'ACTIF') {
      void this.dependances.serviceEvenementsNotification.publier({
        code: 'ADMIN_REQUEST_APPROVED',
        titre: 'Demande admin approuvee',
        message: 'Une demande administrateur a ete approuvee.',
        severite: 'info',
        rolesDestinataires: ['ADMIN', 'SUPER_ADMIN'],
        destinataires: {
          ADMIN: this.extraireDestinatairesAdminDepuisDemande(dto),
        },
        details: {
          ...this.extraireChampsAlerteDemandeAdmin(dto),
          previousStatus: statutAvant || null,
          approvedByUserId: contexte.utilisateurId ?? null,
          approvedAt: new Date().toISOString(),
        },
        tags: ['kya', 'admin-request', 'approved'],
      })
    }
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

  private async preparerCorpsDemandeAdmin(
    corps: Record<string, unknown>,
    motDePasseExistant: string | null = null
  ): Promise<Record<string, unknown>> {
    const motDePasseBrut = ServiceAdministrationAdminUtilitaires.versTexteOptionnel(
      corps.password || corps.motDePasse
    )
    const motDePasse = motDePasseBrut
      ? await this.dependances.serviceHachageMotDePasse.hacher(motDePasseBrut)
      : motDePasseExistant

    if (!motDePasse) return { ...corps }

    return {
      ...corps,
      password: motDePasse,
      motDePasse,
    }
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

  private extraireChampsAlerteDemandeAdmin(donnees: Record<string, unknown>): Record<string, unknown> {
    return {
      id: donnees.id ?? null,
      name: donnees.name ?? null,
      email: donnees.email ?? null,
      phone: donnees.phone ?? null,
      entrepriseName: donnees.entrepriseName ?? null,
      status: donnees.status ?? null,
      createdAt: donnees.createdAt ?? null,
    }
  }

  private publierEvenementDemandeAdminCreee(
    donnees: Record<string, unknown>,
    createurUtilisateurId: string | null
  ): void {
    void this.dependances.serviceEvenementsNotification.publier({
      code: 'ADMIN_REQUEST_CREATED',
      titre: 'Nouvelle demande admin a valider',
      message: 'Une nouvelle demande administrateur a ete soumise.',
      severite: 'warning',
      rolesDestinataires: ['SUPER_ADMIN'],
      details: {
        ...this.extraireChampsAlerteDemandeAdmin(donnees),
        createdByUserId: createurUtilisateurId,
      },
      tags: ['kya', 'admin-request', 'created'],
    })
  }

  private extraireDestinatairesAdminDepuisDemande(
    donnees: Record<string, unknown>
  ): Array<{ email: string; nom?: string; role: 'ADMIN' }> {
    const email = this.normaliserEmail(donnees.email)
    if (!email) return []
    const nom = String(donnees.name || '').trim()
    return [
      {
        email,
        ...(nom ? { nom } : {}),
        role: 'ADMIN',
      },
    ]
  }

  private normaliserEmail(valeur: unknown): string | null {
    const email = String(valeur || '').trim()
    if (!email) return null
    const formatValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    return formatValide ? email : null
  }
}
