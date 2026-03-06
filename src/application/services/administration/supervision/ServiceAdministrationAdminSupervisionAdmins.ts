import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import type { TypeDependancesServiceAdministrationAdminSupervision } from '@/src/application/types/administration/supervision/TypeDependancesServiceAdministrationAdminSupervision'
import { ServiceAdministrationAdminUtilitaires } from '@/src/application/services/administration/commun/ServiceAdministrationAdminUtilitaires'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { EntiteAdmin } from '@/src/domaine/entites/administration/EntiteAdmin'
import { EntiteUtilisateur } from '@/src/domaine/entites/utilisateurs/EntiteUtilisateur'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

type TypeDependancesSupervisionAdmins = Pick<
  TypeDependancesServiceAdministrationAdminSupervision,
  | 'securite'
  | 'annulation'
  | 'daoAdmin'
  | 'daoUtilisateur'
  | 'serviceHachageMotDePasse'
  | 'serviceEvenementsNotification'
  | 'constructeur'
  | 'mappeur'
>

export class ServiceAdministrationAdminSupervisionAdmins {
  constructor(private readonly dependances: TypeDependancesSupervisionAdmins) {}

  public async listerAdmins(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ): Promise<Record<string, unknown>[]> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admins')
    const elements = (await this.dependances.daoAdmin.lister()).map((admin) =>
      this.dependances.mappeur.mapperAdminEnDto(admin)
    )
    return ServiceAdministrationAdminUtilitaires.trierElements(elements, champTri, ordreTri)
  }

  public async obtenirAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    adminId: string
  ): Promise<Record<string, unknown>> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admins')
    const admin = await this.dependances.daoAdmin.rechercherParId(adminId)
    this.exigerEntite(admin, t(ERRORS.ADMIN_ADMIN_INTROUVABLE))
    return this.dependances.mappeur.mapperAdminEnDto(admin)
  }

  public async creerAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admins')
    const entite = this.dependances.constructeur.construireEntiteAdminDepuisCorps(corps)
    const utilisateurAvant = await this.dependances.daoUtilisateur.rechercherParId(entite.utilisateurId)
    const motDePasseHash = await this.resoudreMotDePasseHashDepuisCorps(corps, null, true)
    const utilisateur = this.construireEntiteUtilisateurAdmin({
      corps,
      admin: entite,
      motDePasseHash,
      utilisateurExistant: utilisateurAvant,
    })
    await this.dependances.daoUtilisateur.sauvegarder(utilisateur)
    const adminSauvegarde = await this.dependances.daoAdmin.sauvegarder(entite)
    const dto = this.dependances.mappeur.mapperAdminEnDto(adminSauvegarde)
    this.publierEvenementAdminCree(dto, contexte.utilisateurId ?? null)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'admins',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/admins/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoAdmin.supprimerParId(entite.id)
        if (utilisateurAvant) {
          await this.dependances.daoUtilisateur.sauvegarder(utilisateurAvant)
          return
        }
        await this.dependances.daoUtilisateur.supprimerParId(entite.utilisateurId)
      },
    })
    return { donnees: dto, annulation }
  }

  public async mettreAJourAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    adminId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admins')
    const existant = await this.dependances.daoAdmin.rechercherParId(adminId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_ADMIN_INTROUVABLE))
    const avantEntite = existant
    const utilisateurAvant = await this.dependances.daoUtilisateur.rechercherParId(existant.utilisateurId)
    const fusion = { ...this.dependances.mappeur.mapperAdminEnDto(existant), ...corps, id: adminId }
    const entite = this.dependances.constructeur.construireEntiteAdminDepuisCorps(fusion, adminId)
    const motDePasseFourni = this.corpsContientMotDePasse(corps)
    const doitSynchroniserUtilisateur =
      Boolean(utilisateurAvant) ||
      (this.corpsContientChampsUtilisateur(corps) && motDePasseFourni)

    if (doitSynchroniserUtilisateur) {
      const motDePasseHash = await this.resoudreMotDePasseHashDepuisCorps(
        corps,
        utilisateurAvant?.motDePasseHash || null,
        false
      )
      const utilisateur = this.construireEntiteUtilisateurAdmin({
        corps,
        admin: entite,
        motDePasseHash,
        utilisateurExistant: utilisateurAvant,
      })
      await this.dependances.daoUtilisateur.sauvegarder(utilisateur)
    }

    const adminSauvegarde = await this.dependances.daoAdmin.sauvegarder(entite)
    const dto = this.dependances.mappeur.mapperAdminEnDto(adminSauvegarde)
    this.publierEvenementAdminMisAJour(dto, contexte.utilisateurId ?? null)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'admins',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/admins/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoAdmin.sauvegarder(avantEntite)
        if (utilisateurAvant) {
          await this.dependances.daoUtilisateur.sauvegarder(utilisateurAvant)
        } else if (doitSynchroniserUtilisateur) {
          await this.dependances.daoUtilisateur.supprimerParId(existant.utilisateurId)
        }
      },
    })
    return { donnees: dto, annulation }
  }

  public async supprimerAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    adminId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'admins')
    const existant = await this.dependances.daoAdmin.rechercherParId(adminId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_ADMIN_INTROUVABLE))
    const avantEntite = existant
    await this.dependances.daoAdmin.supprimerParId(adminId)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'admins',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: adminId,
      path: `/admins/${adminId}`,
      executerRollback: async () => {
        await this.dependances.daoAdmin.sauvegarder(avantEntite)
      },
    })
    return { donnees: { ok: true }, annulation }
  }

  private exigerEntite<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }

  private corpsContientChampsUtilisateur(corps: Record<string, unknown>): boolean {
    const champs = [
      'username',
      'nomUtilisateur',
      'name',
      'nomComplet',
      'email',
      'phone',
      'telephone',
      'status',
      'statut',
      'password',
      'motDePasse',
    ]
    return champs.some((champ) => Object.prototype.hasOwnProperty.call(corps, champ))
  }

  private corpsContientMotDePasse(corps: Record<string, unknown>): boolean {
    const motDePasseBrut = String(corps.password || corps.motDePasse || '').trim()
    return Boolean(motDePasseBrut)
  }

  private async resoudreMotDePasseHashDepuisCorps(
    corps: Record<string, unknown>,
    fallbackHash: string | null,
    requis: boolean
  ): Promise<string> {
    const motDePasseBrut = String(corps.password || corps.motDePasse || '').trim()
    if (motDePasseBrut) {
      return this.dependances.serviceHachageMotDePasse.hacher(motDePasseBrut)
    }
    if (fallbackHash) return fallbackHash
    if (requis) {
      throw new ErreurHttp(CODE_HTTP.MAUVAISE_REQUETE, 'Mot de passe admin requis.')
    }
    return ''
  }

  private construireEntiteUtilisateurAdmin({
    corps,
    admin,
    motDePasseHash,
    utilisateurExistant,
  }: {
    corps: Record<string, unknown>
    admin: EntiteAdmin
    motDePasseHash: string
    utilisateurExistant: EntiteUtilisateur | null
  }): EntiteUtilisateur {
    const username =
      ServiceAdministrationAdminUtilitaires.versTexteOptionnel(
        corps.username || corps.nomUtilisateur || corps.phone || corps.telephone
      ) ||
      utilisateurExistant?.identifiantConnexion ||
      admin.nomUtilisateur ||
      admin.utilisateurId

    const name =
      ServiceAdministrationAdminUtilitaires.versTexteOptionnel(
        corps.name || corps.nomComplet || corps.nom
      ) ||
      utilisateurExistant?.nomComplet ||
      admin.nom ||
      username

    const email =
      ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.email) ||
      utilisateurExistant?.email.valeur ||
      admin.email ||
      `${username}@kya.local`

    const phone =
      ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.phone || corps.telephone) ||
      utilisateurExistant?.telephone ||
      undefined

    const statutUtilisateur = this.normaliserStatutUtilisateurDepuisAdmin(
      corps.status || corps.statut || admin.statut
    )

    const fusionUtilisateur: Record<string, unknown> = {
      id: admin.utilisateurId,
      username,
      name,
      email,
      role: 'ADMIN',
      status: statutUtilisateur,
      password: motDePasseHash,
    }
    if (phone) {
      fusionUtilisateur.phone = phone
    }

    return this.dependances.constructeur.construireEntiteUtilisateurDepuisCorps(
      fusionUtilisateur,
      admin.utilisateurId
    )
  }

  private normaliserStatutUtilisateurDepuisAdmin(
    statutAdmin: unknown
  ): 'ACTIF' | 'SUSPENDU' | 'ARCHIVE' {
    const statut = String(statutAdmin || '').toUpperCase()
    if (statut === 'ARCHIVE') return 'ARCHIVE'
    if (statut === 'SUSPENDU' || statut === 'BLACKLISTE') return 'SUSPENDU'
    return 'ACTIF'
  }

  private publierEvenementAdminCree(donnees: Record<string, unknown>, createurUtilisateurId: string | null): void {
    void this.dependances.serviceEvenementsNotification.publier({
      code: 'ADMIN_CREATED',
      titre: 'Compte admin cree',
      message: 'Un nouveau compte administrateur a ete cree.',
      severite: 'info',
      rolesDestinataires: ['ADMIN', 'SUPER_ADMIN'],
      destinataires: {
        ADMIN: this.extraireDestinataireAdmin(donnees),
      },
      details: {
        ...this.extraireChampsAlerteAdmin(donnees),
        createdByUserId: createurUtilisateurId,
      },
      tags: ['kya', 'admin', 'created'],
    })
  }

  private publierEvenementAdminMisAJour(
    donnees: Record<string, unknown>,
    modificateurUtilisateurId: string | null
  ): void {
    void this.dependances.serviceEvenementsNotification.publier({
      code: 'ADMIN_UPDATED',
      titre: 'Compte admin mis a jour',
      message: 'Les informations d un compte administrateur ont ete modifiees.',
      severite: 'info',
      rolesDestinataires: ['ADMIN', 'SUPER_ADMIN'],
      destinataires: {
        ADMIN: this.extraireDestinataireAdmin(donnees),
      },
      details: {
        ...this.extraireChampsAlerteAdmin(donnees),
        updatedByUserId: modificateurUtilisateurId,
      },
      tags: ['kya', 'admin', 'updated'],
    })
  }

  private extraireDestinataireAdmin(
    donnees: Record<string, unknown>
  ): Array<{ email: string; nom?: string; role: 'ADMIN' }> {
    const email = this.normaliserEmail(donnees.email)
    if (!email) return []
    const nom = this.normaliserTexte(donnees.name)
    return [
      {
        email,
        ...(nom ? { nom } : {}),
        role: 'ADMIN',
      },
    ]
  }

  private extraireChampsAlerteAdmin(donnees: Record<string, unknown>): Record<string, unknown> {
    return {
      id: donnees.id ?? null,
      userId: donnees.userId ?? null,
      username: donnees.username ?? null,
      name: donnees.name ?? null,
      email: donnees.email ?? null,
      status: donnees.status ?? null,
      entrepriseId: donnees.entrepriseId ?? null,
      createdAt: donnees.createdAt ?? null,
    }
  }

  private normaliserEmail(valeur: unknown): string | null {
    const email = String(valeur || '').trim()
    if (!email) return null
    const formatValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    return formatValide ? email : null
  }

  private normaliserTexte(valeur: unknown): string {
    return String(valeur || '').trim()
  }
}
