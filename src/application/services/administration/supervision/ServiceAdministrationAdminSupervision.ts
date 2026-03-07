import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import type { TypeDependancesServiceAdministrationAdminSupervision } from '@/src/application/types/administration/supervision/TypeDependancesServiceAdministrationAdminSupervision'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { ServiceAdministrationAdminSupervisionAdmins } from '@/src/application/services/administration/supervision/ServiceAdministrationAdminSupervisionAdmins'
import { ServiceAdministrationAdminSupervisionDemandes } from '@/src/application/services/administration/supervision/ServiceAdministrationAdminSupervisionDemandes'
import { ServiceAdministrationAdminSupervisionEntreprises } from '@/src/application/services/administration/supervision/ServiceAdministrationAdminSupervisionEntreprises'
import { ServiceAdministrationAdminSupervisionUtilisateurs } from '@/src/application/services/administration/supervision/ServiceAdministrationAdminSupervisionUtilisateurs'

export class ServiceAdministrationAdminSupervision {
  private readonly dependances: TypeDependancesServiceAdministrationAdminSupervision
  private readonly serviceAdmins: ServiceAdministrationAdminSupervisionAdmins
  private readonly serviceDemandes: ServiceAdministrationAdminSupervisionDemandes
  private readonly serviceEntreprises: ServiceAdministrationAdminSupervisionEntreprises
  private readonly serviceUtilisateurs: ServiceAdministrationAdminSupervisionUtilisateurs

  constructor(dependances: TypeDependancesServiceAdministrationAdminSupervision) {
    this.dependances = dependances
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

  public async mettreAJourDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    demandeId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const demandeAvant = await this.serviceDemandes.obtenirDemandeAdmin(
      jetonAcces,
      impersonation,
      demandeId
    )
    const resultat = await this.serviceDemandes.mettreAJourDemandeAdmin(
      jetonAcces,
      impersonation,
      demandeId,
      corps
    )

    const statutAvant = this.normaliserStatut(demandeAvant.status)
    const statutApres = this.normaliserStatut(resultat.donnees.status)

    if (statutAvant !== 'ACTIF' && statutApres === 'ACTIF') {
      try {
        await this.provisionnerDemandeAdminApprouvee(
          jetonAcces,
          impersonation,
          resultat.donnees
        )
      } catch (error) {
        await this.annulerMiseAJourDemandeAdmin(
          jetonAcces,
          impersonation,
          resultat.annulation.id
        )
        throw error
      }
    }

    return resultat
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

  private async provisionnerDemandeAdminApprouvee(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    demande: Record<string, unknown>
  ): Promise<void> {
    const demandeId = String(demande.id || '').trim()
    if (!demandeId) return

    const username = this.resoudreNomUtilisateurDemande(demande)
    const adminResultat = await this.serviceAdmins.creerAdmin(jetonAcces, impersonation, {
      id: demandeId,
      userId: demandeId,
      adminRequestId: demandeId,
      username,
      name: String(demande.name || username).trim() || username,
      email: this.resoudreEmailDemande(demande, username),
      phone: this.texteOptionnel(demande.phone) || undefined,
      status: 'ACTIF',
      createdAt: this.texteOptionnel(demande.createdAt) || new Date().toISOString(),
    })

    const entrepriseName = this.texteOptionnel(demande.entrepriseName)
    if (!entrepriseName) return

    try {
      const adminId = String(adminResultat.donnees.id || demandeId).trim()
      await this.serviceEntreprises.creerEntreprise(jetonAcces, impersonation, {
        id: `${adminId}-entreprise`,
        name: entrepriseName,
        adminId,
        createdAt: this.texteOptionnel(demande.createdAt) || new Date().toISOString(),
      })
    } catch (error) {
      await this.annulerCreationAdmin(jetonAcces, impersonation, adminResultat.annulation.id)
      throw error
    }
  }

  private async annulerMiseAJourDemandeAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    actionId: string
  ): Promise<void> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(
      jetonAcces,
      impersonation,
      'admin_requests'
    )
    await this.dependances.annulation.annulerAction(contexte.utilisateurId, actionId)
  }

  private async annulerCreationAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    actionId: string
  ): Promise<void> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(
      jetonAcces,
      impersonation,
      'admins'
    )
    await this.dependances.annulation.annulerAction(contexte.utilisateurId, actionId)
  }

  private normaliserStatut(valeur: unknown): string {
    return String(valeur || '').trim().toUpperCase()
  }

  private texteOptionnel(valeur: unknown): string | null {
    const texte = String(valeur || '').trim()
    return texte || null
  }

  private resoudreNomUtilisateurDemande(demande: Record<string, unknown>): string {
    const username = this.texteOptionnel(demande.username)
    if (username) return username

    const phone = this.texteOptionnel(demande.phone)
    if (phone) return phone.replace(/\D/g, '')

    const name = this.texteOptionnel(demande.name)
    if (name) {
      const compact = name
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '')
      if (compact) return compact
    }

    return `admin-${Date.now()}`
  }

  private resoudreEmailDemande(demande: Record<string, unknown>, username: string): string {
    const email = this.texteOptionnel(demande.email)
    if (email) return email
    return `${username}@kya.local`
  }
}
