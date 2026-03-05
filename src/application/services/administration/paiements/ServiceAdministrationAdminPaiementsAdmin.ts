import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { ExceptionAuthentificationAutorisation } from '@/src/application/exceptions'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import type { TypeDependancesServiceAdministrationAdminPaiementsAdmin } from '@/src/application/types/administration/paiements/TypeDependancesServiceAdministrationAdminPaiementsAdmin'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

export class ServiceAdministrationAdminPaiementsAdmin {
  constructor(private readonly dependances: TypeDependancesServiceAdministrationAdminPaiementsAdmin) {}

  public async listerPaiementsAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    return (await this.dependances.daoPaiementAbonnementAdmin.lister())
      .filter((paiement) => paiement.adminId === contexte.adminId)
      .map((paiement) => this.dependances.mappeur.mapperPaiementAdminEnDto(paiement))
  }

  public async obtenirPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ): Promise<Record<string, unknown>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    const paiement = await this.dependances.daoPaiementAbonnementAdmin.rechercherParId(paiementId)
    this.exigerEntite(paiement, t(ERRORS.ADMIN_PAIEMENT_ABONNEMENT_INTROUVABLE))
    if (paiement.adminId !== contexte.adminId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }
    return this.dependances.mappeur.mapperPaiementAdminEnDto(paiement)
  }

  public async creerPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    const fusion = { ...corps, adminId: String(corps.adminId || contexte.adminId) }
    const entite = this.dependances.constructeur.construireEntitePaiementAdminDepuisCorps(fusion)
    if (entite.adminId !== contexte.adminId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    await this.dependances.daoPaiementAbonnementAdmin.sauvegarder(entite)
    await this.dependances.constructeur.mettreAJourStatutDepuisPaiementAdmin(
      entite,
      this.dependances.daoStatutAbonnementAdmin
    )

    const dto = this.dependances.mappeur.mapperPaiementAdminEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'admin_payments',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/admin_payments/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoPaiementAbonnementAdmin.supprimerParId(entite.id)
      },
    })

    return { donnees: dto, annulation }
  }

  public async mettreAJourPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    const existant = await this.dependances.daoPaiementAbonnementAdmin.rechercherParId(paiementId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_PAIEMENT_ABONNEMENT_INTROUVABLE))
    if (existant.adminId !== contexte.adminId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    const avantEntite = existant
    const fusion = {
      ...this.dependances.mappeur.mapperPaiementAdminEnDto(existant),
      ...corps,
      id: paiementId,
      adminId: contexte.adminId,
    }
    const entite = this.dependances.constructeur.construireEntitePaiementAdminDepuisCorps(
      fusion,
      paiementId
    )

    await this.dependances.daoPaiementAbonnementAdmin.sauvegarder(entite)
    await this.dependances.constructeur.mettreAJourStatutDepuisPaiementAdmin(
      entite,
      this.dependances.daoStatutAbonnementAdmin
    )

    const dto = this.dependances.mappeur.mapperPaiementAdminEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'admin_payments',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/admin_payments/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoPaiementAbonnementAdmin.sauvegarder(avantEntite)
      },
    })

    return { donnees: dto, annulation }
  }

  public async supprimerPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    const existant = await this.dependances.daoPaiementAbonnementAdmin.rechercherParId(paiementId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_PAIEMENT_ABONNEMENT_INTROUVABLE))
    if (existant.adminId !== contexte.adminId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    const avantEntite = existant
    await this.dependances.daoPaiementAbonnementAdmin.supprimerParId(paiementId)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'admin_payments',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: paiementId,
      path: `/admin_payments/${paiementId}`,
      executerRollback: async () => {
        await this.dependances.daoPaiementAbonnementAdmin.sauvegarder(avantEntite)
      },
    })

    return { donnees: { ok: true }, annulation }
  }

  public async obtenirStatutPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    adminIdRequete?: string | null
  ): Promise<Record<string, unknown>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    const adminId = String(adminIdRequete || contexte.adminId)
    if (adminId !== contexte.adminId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    const existant = await this.dependances.daoStatutAbonnementAdmin.rechercherParId(adminId)
    const statut =
      existant ||
      (await this.dependances.constructeur.creerStatutAbonnementParDefaut(
        adminId,
        this.dependances.daoStatutAbonnementAdmin
      ))

    return this.dependances.mappeur.mapperStatutPaiementAdminEnDto(statut)
  }

  private exigerEntite<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }
}
