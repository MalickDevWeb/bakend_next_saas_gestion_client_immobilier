import {
  TypeActionAnnulationInterneAdministrationAdmin,
  TypeMetadonneesActionAnnulationAdministrationAdmin,
  TypeOperationAnnulationAdministrationAdmin,
  TypeRessourceAdministrationAdmin,
} from '@/src/domaine/types/administration'
import { DUREE_ANNULATION_MILLISECONDES, CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { ExceptionAuthentificationAutorisation } from '@/src/application/exceptions'
import { randomUUID } from 'node:crypto'

type TypeCommandeEnregistrementActionAnnulation = {
  ressource: TypeRessourceAdministrationAdmin
  operation: TypeOperationAnnulationAdministrationAdmin
  actorId: string
  resourceId?: string
  path?: string
  executerRollback: () => Promise<void>
}

export class ServiceAdministrationAdminAnnulation {
  private readonly actionsAnnulation = new Map<
    string,
    TypeActionAnnulationInterneAdministrationAdmin
  >()

  public enregistrerActionAnnulation(
    commande: TypeCommandeEnregistrementActionAnnulation
  ): TypeMetadonneesActionAnnulationAdministrationAdmin {
    const id = randomUUID()
    const createdAt = new Date()
    const expiresAt = new Date(
      createdAt.getTime() + DUREE_ANNULATION_MILLISECONDES
    )

    const metadonnees: TypeMetadonneesActionAnnulationAdministrationAdmin = {
      id,
      resource: commande.ressource,
      resourceId: commande.resourceId || null,
      method: this.mapperOperationEnMethodeHttp(commande.operation),
      actorId: commande.actorId,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      path: commande.path,
    }

    this.actionsAnnulation.set(id, {
      metadonnees,
      operation: commande.operation,
      executerRollback: commande.executerRollback,
    })

    return metadonnees
  }

  public listerActionsAnnulation(
    utilisateurId: string,
    limite: number
  ): TypeMetadonneesActionAnnulationAdministrationAdmin[] {
    const maintenant = Date.now()
    const limiteProtegee = Math.max(1, Math.min(100, limite))

    return Array.from(this.actionsAnnulation.values())
      .filter((action) => {
        const expireLe = new Date(action.metadonnees.expiresAt).getTime()
        if (!Number.isFinite(expireLe) || expireLe <= maintenant) {
          return false
        }
        return action.metadonnees.actorId === utilisateurId
      })
      .sort(
        (a, b) =>
          new Date(b.metadonnees.createdAt).getTime() -
          new Date(a.metadonnees.createdAt).getTime()
      )
      .slice(0, limiteProtegee)
      .map((action) => action.metadonnees)
  }

  public async annulerAction(
    utilisateurId: string,
    actionId: string
  ): Promise<{ ok: true; rolledBackId: string }> {
    const action = this.actionsAnnulation.get(actionId)
    if (!action) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, t(ERRORS.ADMIN_ACTION_ANNULATION_INTROUVABLE))
    }

    if (action.metadonnees.actorId !== utilisateurId) {
      throw new ExceptionAuthentificationAutorisation(
        t(ERRORS.AUTH_PERMISSION_MANQUANTE)
      )
    }

    const expireLe = new Date(action.metadonnees.expiresAt).getTime()
    if (!Number.isFinite(expireLe) || expireLe <= Date.now()) {
      this.actionsAnnulation.delete(actionId)
      throw new ErreurHttp(CODE_HTTP.CONFLIT, t(ERRORS.ADMIN_ROLLBACK_EXPIRE))
    }

    await action.executerRollback()
    this.actionsAnnulation.delete(actionId)

    return { ok: true, rolledBackId: actionId }
  }

  private mapperOperationEnMethodeHttp(
    operation: TypeOperationAnnulationAdministrationAdmin
  ): 'POST' | 'PUT' | 'PATCH' | 'DELETE' {
    if (operation === 'CREATE') {
      return 'POST'
    }

    if (operation === 'DELETE') {
      return 'DELETE'
    }

    return 'PATCH'
  }
}
