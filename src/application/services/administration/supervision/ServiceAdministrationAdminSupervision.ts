import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import type { TypeDependancesServiceAdministrationAdminSupervision } from '@/src/application/types/administration/supervision/TypeDependancesServiceAdministrationAdminSupervision'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { ServiceAdministrationAdminSupervisionAdmins } from '@/src/application/services/administration/supervision/ServiceAdministrationAdminSupervisionAdmins'
import { ServiceAdministrationAdminSupervisionDemandes } from '@/src/application/services/administration/supervision/ServiceAdministrationAdminSupervisionDemandes'
import { ServiceAdministrationAdminSupervisionEntreprises } from '@/src/application/services/administration/supervision/ServiceAdministrationAdminSupervisionEntreprises'
import { ServiceAdministrationAdminSupervisionUtilisateurs } from '@/src/application/services/administration/supervision/ServiceAdministrationAdminSupervisionUtilisateurs'

export class ServiceAdministrationAdminSupervision {
  private readonly serviceAdmins: ServiceAdministrationAdminSupervisionAdmins
  private readonly serviceDemandes: ServiceAdministrationAdminSupervisionDemandes
  private readonly serviceEntreprises: ServiceAdministrationAdminSupervisionEntreprises
  private readonly serviceUtilisateurs: ServiceAdministrationAdminSupervisionUtilisateurs

  constructor(dependances: TypeDependancesServiceAdministrationAdminSupervision) {
    this.serviceAdmins = new ServiceAdministrationAdminSupervisionAdmins(dependances)
    this.serviceDemandes = new ServiceAdministrationAdminSupervisionDemandes(dependances)
    this.serviceEntreprises = new ServiceAdministrationAdminSupervisionEntreprises(dependances)
    this.serviceUtilisateurs = new ServiceAdministrationAdminSupervisionUtilisateurs(dependances)
  }

  public listerAdmins(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ) {
    return this.serviceAdmins.listerAdmins(jetonAcces, impersonation, champTri, ordreTri)
  }

  public obtenirAdmin(jetonAcces: string, impersonation: DtoEtatImpersonation, adminId: string) {
    return this.serviceAdmins.obtenirAdmin(jetonAcces, impersonation, adminId)
  }

  public creerAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    return this.serviceAdmins.creerAdmin(jetonAcces, impersonation, corps)
  }

  public mettreAJourAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    adminId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    return this.serviceAdmins.mettreAJourAdmin(jetonAcces, impersonation, adminId, corps)
  }

  public supprimerAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    adminId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    return this.serviceAdmins.supprimerAdmin(jetonAcces, impersonation, adminId)
  }

  public listerDemandesAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ) {
    return this.serviceDemandes.listerDemandesAdmin(jetonAcces, impersonation, champTri, ordreTri)
  }

  public obtenirDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    demandeId: string
  ) {
    return this.serviceDemandes.obtenirDemandeAdmin(jetonAcces, impersonation, demandeId)
  }

  public creerDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    return this.serviceDemandes.creerDemandeAdmin(jetonAcces, impersonation, corps)
  }

  public creerDemandeAdminPublique(
    corps: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return this.serviceDemandes.creerDemandeAdminPublique(corps)
  }

  public mettreAJourDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    demandeId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    return this.serviceDemandes.mettreAJourDemandeAdmin(jetonAcces, impersonation, demandeId, corps)
  }

  public supprimerDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    demandeId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    return this.serviceDemandes.supprimerDemandeAdmin(jetonAcces, impersonation, demandeId)
  }

  public verifierDemandeAdminEnAttente(identifiant: string, motDePasse: string): Promise<boolean> {
    return this.serviceDemandes.verifierDemandeAdminEnAttente(identifiant, motDePasse)
  }

  public listerEntreprises(jetonAcces: string, impersonation: DtoEtatImpersonation) {
    return this.serviceEntreprises.listerEntreprises(jetonAcces, impersonation)
  }

  public obtenirEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    entrepriseId: string
  ) {
    return this.serviceEntreprises.obtenirEntreprise(jetonAcces, impersonation, entrepriseId)
  }

  public creerEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    return this.serviceEntreprises.creerEntreprise(jetonAcces, impersonation, corps)
  }

  public mettreAJourEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    entrepriseId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    return this.serviceEntreprises.mettreAJourEntreprise(jetonAcces, impersonation, entrepriseId, corps)
  }

  public supprimerEntreprise(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    entrepriseId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    return this.serviceEntreprises.supprimerEntreprise(jetonAcces, impersonation, entrepriseId)
  }

  public listerUtilisateurs(jetonAcces: string, impersonation: DtoEtatImpersonation) {
    return this.serviceUtilisateurs.listerUtilisateurs(jetonAcces, impersonation)
  }

  public obtenirUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    utilisateurId: string
  ) {
    return this.serviceUtilisateurs.obtenirUtilisateur(jetonAcces, impersonation, utilisateurId)
  }

  public creerUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    return this.serviceUtilisateurs.creerUtilisateur(jetonAcces, impersonation, corps)
  }

  public mettreAJourUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    utilisateurId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    return this.serviceUtilisateurs.mettreAJourUtilisateur(jetonAcces, impersonation, utilisateurId, corps)
  }

  public supprimerUtilisateur(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    utilisateurId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    return this.serviceUtilisateurs.supprimerUtilisateur(jetonAcces, impersonation, utilisateurId)
  }
}
