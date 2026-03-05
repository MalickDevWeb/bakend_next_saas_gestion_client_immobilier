import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import {
  TypeEnregistrementParametreAdministrationAdmin,
  TypeResultatMutationAdministrationAdmin,
} from '@/src/domaine/types/administration'
import type { TypeDependancesServiceAdministrationAdminParametres } from '@/src/application/types/administration/travaux/TypeDependancesServiceAdministrationAdminParametres'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

export class ServiceAdministrationAdminParametres {
  private readonly parametresParAdmin = new Map<
    string,
    Map<string, TypeEnregistrementParametreAdministrationAdmin>
  >()

  constructor(private readonly dependances: TypeDependancesServiceAdministrationAdminParametres) {}

  public async listerParametres(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    cle?: string | null
  ): Promise<TypeEnregistrementParametreAdministrationAdmin[]> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(
      jetonAcces,
      impersonation,
      'settings'
    )
    const elements = this.dependances.daoParametreAdmin
      ? await this.dependances.daoParametreAdmin.listerParAdmin(contexte.adminId)
      : Array.from(this.obtenirIndexParametres(contexte.adminId).values())
    if (!cle) return elements
    return elements.filter((element) => element.key === cle)
  }

  public async creerParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<TypeEnregistrementParametreAdministrationAdmin>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(
      jetonAcces,
      impersonation,
      'settings'
    )
    const index = this.obtenirIndexParametres(contexte.adminId)
    const cle = String(corps.key || '').trim()
    const valeur = String(corps.value ?? '').trim()
    if (!cle) {
      throw new ErreurHttp(CODE_HTTP.MAUVAISE_REQUETE, t(ERRORS.PARAMETRES_INVALIDES))
    }

    const id = String(corps.id || cle).trim() || cle
    const maintenant = new Date().toISOString()
    const precedent = this.dependances.daoParametreAdmin
      ? await this.dependances.daoParametreAdmin.rechercherParAdminEtId(contexte.adminId, id)
      : index.get(id)
    const enregistrement: TypeEnregistrementParametreAdministrationAdmin = {
      id,
      key: cle,
      value: valeur,
      createdAt: precedent?.createdAt || maintenant,
      updatedAt: maintenant,
    }
    if (this.dependances.daoParametreAdmin) {
      await this.dependances.daoParametreAdmin.sauvegarder(contexte.adminId, enregistrement)
    } else {
      index.set(id, enregistrement)
    }

    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'settings',
      operation: precedent ? 'UPDATE' : 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: id,
      path: `/settings/${id}`,
      executerRollback: async () => {
        if (precedent) {
          if (this.dependances.daoParametreAdmin) {
            await this.dependances.daoParametreAdmin.sauvegarder(contexte.adminId, precedent)
            return
          }
          index.set(id, precedent)
          return
        }
        if (this.dependances.daoParametreAdmin) {
          await this.dependances.daoParametreAdmin.supprimerParAdminEtId(contexte.adminId, id)
          return
        }
        index.delete(id)
      },
    })

    return { donnees: enregistrement, annulation }
  }

  public async mettreAJourParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    parametreId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<TypeEnregistrementParametreAdministrationAdmin>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(
      jetonAcces,
      impersonation,
      'settings'
    )
    const index = this.obtenirIndexParametres(contexte.adminId)
    const existant = this.dependances.daoParametreAdmin
      ? await this.dependances.daoParametreAdmin.rechercherParAdminEtId(
          contexte.adminId,
          parametreId
        )
      : index.get(parametreId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_PARAMETRE_INTROUVABLE))

    const suivant: TypeEnregistrementParametreAdministrationAdmin = {
      id: parametreId,
      key: String(corps.key || existant.key).trim(),
      value: String(corps.value ?? existant.value).trim(),
      createdAt: existant.createdAt,
      updatedAt: new Date().toISOString(),
    }
    if (this.dependances.daoParametreAdmin) {
      await this.dependances.daoParametreAdmin.sauvegarder(contexte.adminId, suivant)
    } else {
      index.set(parametreId, suivant)
    }

    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'settings',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: parametreId,
      path: `/settings/${parametreId}`,
      executerRollback: async () => {
        if (this.dependances.daoParametreAdmin) {
          await this.dependances.daoParametreAdmin.sauvegarder(contexte.adminId, existant)
          return
        }
        index.set(parametreId, existant)
      },
    })

    return { donnees: suivant, annulation }
  }

  public async supprimerParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    parametreId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(
      jetonAcces,
      impersonation,
      'settings'
    )
    const index = this.obtenirIndexParametres(contexte.adminId)
    const existant = this.dependances.daoParametreAdmin
      ? await this.dependances.daoParametreAdmin.rechercherParAdminEtId(
          contexte.adminId,
          parametreId
        )
      : index.get(parametreId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_PARAMETRE_INTROUVABLE))

    if (this.dependances.daoParametreAdmin) {
      await this.dependances.daoParametreAdmin.supprimerParAdminEtId(contexte.adminId, parametreId)
    } else {
      index.delete(parametreId)
    }
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'settings',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: parametreId,
      path: `/settings/${parametreId}`,
      executerRollback: async () => {
        if (this.dependances.daoParametreAdmin) {
          await this.dependances.daoParametreAdmin.sauvegarder(contexte.adminId, existant)
          return
        }
        index.set(parametreId, existant)
      },
    })

    return { donnees: { ok: true }, annulation }
  }

  private obtenirIndexParametres(adminId: string): Map<string, TypeEnregistrementParametreAdministrationAdmin> {
    const cle = String(adminId || '').trim()
    const existant = this.parametresParAdmin.get(cle)
    if (existant) return existant
    const nouveau = new Map<string, TypeEnregistrementParametreAdministrationAdmin>()
    this.parametresParAdmin.set(cle, nouveau)
    return nouveau
  }

  private exigerEntite<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }
}
