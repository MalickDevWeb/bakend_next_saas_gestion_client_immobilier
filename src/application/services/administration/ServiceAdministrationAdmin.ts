import { randomUUID } from 'node:crypto'
import {
  BuilderEntiteCaution,
  BuilderEntiteClient,
  BuilderEntiteDocument,
  BuilderEntiteErreurImport,
  BuilderEntiteExecutionImport,
  BuilderEntiteIpBloquee,
  BuilderEntiteItemTravail,
  BuilderEntiteJournalAudit,
  BuilderEntiteLocation,
  BuilderEntiteNotification,
  BuilderEntitePaiementAbonnementAdmin,
  BuilderEntitePaiementCaution,
  BuilderEntitePaiementMensuel,
  BuilderEntiteStatutAbonnementAdmin,
  BuilderEntiteTransactionPaiement,
} from '@/src/domaine/builders'
import {
  EntiteClient,
  EntiteDocument,
  EntiteExecutionImport,
  EntiteIpBloquee,
  EntiteItemTravail,
  EntiteJournalAudit,
  EntiteLocation,
  EntiteNotification,
  EntitePaiementAbonnementAdmin,
  EntitePaiementCaution,
  EntitePaiementMensuel,
  EntiteTransactionPaiement,
} from '@/src/domaine/entites'
import {
  InterfaceDaoClient,
  InterfaceDaoDocument,
  InterfaceDaoExecutionImport,
  InterfaceDaoIpBloquee,
  InterfaceDaoItemTravail,
  InterfaceDaoJournalAudit,
  InterfaceDaoNotification,
  InterfaceDaoPaiementAbonnementAdmin,
  InterfaceDaoPaiementCaution,
  InterfaceDaoStatutAbonnementAdmin,
  InterfaceDaoTransactionPaiement,
} from '@/src/domaine/interfaces/dao'
import { ServiceAuthentification } from '@/src/application/services/authentification/ServiceAuthentification'
import {
  TypeContexteAccesAdministrationAdmin,
  TypeMetadonneesActionAnnulationAdministrationAdmin,
  TypeRessourceAdministrationAdmin,
} from '@/src/domaine/types/administration'
import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import {
  ExceptionAuthentificationAutorisation,
  ExceptionAuthentificationValidation,
} from '@/src/application/exceptions'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

type TypeOrdreTri = 'asc' | 'desc'

type TypeEnregistrementParametre = {
  id: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

type TypeOperationAnnulation = 'CREATE' | 'UPDATE' | 'DELETE'

type TypeActionAnnulationInterne = {
  metadonnees: TypeMetadonneesActionAnnulationAdministrationAdmin
  operation: TypeOperationAnnulation
  avant?: unknown
  apres?: unknown
}

type TypeResultatMutationAdministration<T> = {
  donnees: T
  annulation: TypeMetadonneesActionAnnulationAdministrationAdmin
}

const CODES_PERMISSIONS_RESSOURCES_ADMIN: Record<TypeRessourceAdministrationAdmin, string | null> = {
  clients: 'CLIENTS_GERER',
  documents: 'DOCUMENTS_GERER',
  payments: 'PAIEMENTS_GERER',
  deposits: 'PAIEMENTS_GERER',
  work_items: 'TRAVAUX_GERER',
  settings: 'PARAMETRES_GERER',
  import_runs: 'IMPORTS_GERER',
  notifications: 'NOTIFICATIONS_GERER',
  'undo-actions': 'PARAMETRES_GERER',
  admin_payments: 'PAIEMENTS_GERER',
  audit_logs: 'PARAMETRES_GERER',
  blocked_ips: 'PARAMETRES_GERER',
  cloudinary: 'DOCUMENTS_GERER',
}

const DUREE_ANNULATION_MILLISECONDES = 60 * 24 * 60 * 60 * 1000

type TypeStatutMouvement = 'pending' | 'completed' | 'failed'

export class ServiceAdministrationAdmin {
  private readonly parametresParAdmin = new Map<string, Map<string, TypeEnregistrementParametre>>()
  private readonly actionsAnnulation = new Map<string, TypeActionAnnulationInterne>()
  private readonly statutsPaiement = new Map<string, TypeStatutMouvement>()
  private readonly statutsDepot = new Map<string, TypeStatutMouvement>()

  constructor(
    private readonly serviceAuthentification: ServiceAuthentification,
    private readonly daoClient: InterfaceDaoClient,
    private readonly daoDocument: InterfaceDaoDocument,
    private readonly daoTransactionPaiement: InterfaceDaoTransactionPaiement,
    private readonly daoPaiementCaution: InterfaceDaoPaiementCaution,
    private readonly daoItemTravail: InterfaceDaoItemTravail,
    private readonly daoExecutionImport: InterfaceDaoExecutionImport,
    private readonly daoNotification: InterfaceDaoNotification,
    private readonly daoIpBloquee: InterfaceDaoIpBloquee,
    private readonly daoJournalAudit: InterfaceDaoJournalAudit,
    private readonly daoPaiementAbonnementAdmin: InterfaceDaoPaiementAbonnementAdmin,
    private readonly daoStatutAbonnementAdmin: InterfaceDaoStatutAbonnementAdmin
  ) {}

  public async listerClients(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ): Promise<Record<string, unknown>[]> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'clients')
    const clients = (await this.daoClient.lister())
      .filter((client) => this.estClientVisibleParAdmin(client, contexte.adminId))
      .map((client) => this.mapperClientEnDto(client))

    return this.trierElements(clients, champTri, ordreTri)
  }

  public async obtenirClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    clientId: string
  ): Promise<Record<string, unknown>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'clients')
    const client = await this.daoClient.rechercherParId(clientId)
    this.exigerEntiteAdmin(client, 'Client introuvable')
    if (!this.estClientVisibleParAdmin(client, contexte.adminId)) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }
    return this.mapperClientEnDto(client)
  }

  public async creerClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'clients')
    const entite = this.construireEntiteClientDepuisCorps(corps, contexte.adminId)
    await this.daoClient.sauvegarder(entite)
    const dto = this.mapperClientEnDto(entite)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'clients',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      apres: dto,
      resourceId: entite.id,
      path: `/clients/${entite.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async mettreAJourClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    clientId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'clients')
    const existant = await this.daoClient.rechercherParId(clientId)
    this.exigerEntiteAdmin(existant, 'Client introuvable')
    if (!this.estClientVisibleParAdmin(existant, contexte.adminId)) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    const avant = this.mapperClientEnDto(existant)
    const fusion = { ...avant, ...corps, id: clientId, adminId: contexte.adminId }
    const entite = this.construireEntiteClientDepuisCorps(fusion, contexte.adminId, clientId)
    await this.daoClient.sauvegarder(entite)
    const dto = this.mapperClientEnDto(entite)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'clients',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      avant,
      apres: dto,
      resourceId: entite.id,
      path: `/clients/${entite.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async supprimerClient(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    clientId: string
  ): Promise<TypeResultatMutationAdministration<{ ok: true }>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'clients')
    const existant = await this.daoClient.rechercherParId(clientId)
    this.exigerEntiteAdmin(existant, 'Client introuvable')
    if (!this.estClientVisibleParAdmin(existant, contexte.adminId)) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }
    const avant = this.mapperClientEnDto(existant)
    await this.daoClient.supprimerParId(clientId)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'clients',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      avant,
      resourceId: clientId,
      path: `/clients/${clientId}`,
    })
    return { donnees: { ok: true }, annulation }
  }

  public async listerDocuments(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'documents')
    return (await this.daoDocument.lister()).map((element) => this.mapperDocumentEnDto(element))
  }

  public async creerDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'documents')
    const document = this.construireEntiteDocumentDepuisCorps(corps)
    await this.daoDocument.sauvegarder(document)
    const dto = this.mapperDocumentEnDto(document)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'documents',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      apres: dto,
      resourceId: document.id,
      path: `/documents/${document.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async obtenirDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    documentId: string
  ): Promise<Record<string, unknown>> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'documents')
    const document = await this.daoDocument.rechercherParId(documentId)
    this.exigerEntiteAdmin(document, 'Document introuvable')
    return this.mapperDocumentEnDto(document)
  }

  public async mettreAJourDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    documentId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'documents')
    const existant = await this.daoDocument.rechercherParId(documentId)
    this.exigerEntiteAdmin(existant, 'Document introuvable')
    const avant = this.mapperDocumentEnDto(existant)
    const fusion = this.versObjet({ ...avant, ...corps, id: documentId })
    const document = this.construireEntiteDocumentDepuisCorps(fusion, documentId)
    await this.daoDocument.sauvegarder(document)
    const dto = this.mapperDocumentEnDto(document)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'documents',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      avant,
      apres: dto,
      resourceId: documentId,
      path: `/documents/${documentId}`,
    })
    return { donnees: dto, annulation }
  }

  public async supprimerDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    documentId: string
  ): Promise<TypeResultatMutationAdministration<{ ok: true }>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'documents')
    const document = await this.daoDocument.rechercherParId(documentId)
    this.exigerEntiteAdmin(document, 'Document introuvable')
    const avant = this.mapperDocumentEnDto(document)
    await this.daoDocument.supprimerParId(documentId)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'documents',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      avant,
      resourceId: documentId,
      path: `/documents/${documentId}`,
    })
    return { donnees: { ok: true }, annulation }
  }

  public async listerPaiements(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'payments')
    return (await this.daoTransactionPaiement.lister()).map((element) =>
      this.mapperPaiementEnDto(element)
    )
  }

  public async obtenirPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ): Promise<Record<string, unknown>> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'payments')
    const paiement = await this.daoTransactionPaiement.rechercherParId(paiementId)
    this.exigerEntiteAdmin(paiement, 'Paiement introuvable')
    return this.mapperPaiementEnDto(paiement)
  }

  public async creerPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'payments')
    const paiement = this.construireEntitePaiementDepuisCorps(corps)
    await this.daoTransactionPaiement.sauvegarder(paiement)
    this.statutsPaiement.set(paiement.id, this.normaliserStatutMouvement(corps.status))
    const dto = this.mapperPaiementEnDto(paiement)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'payments',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      apres: dto,
      resourceId: paiement.id,
      path: `/payments/${paiement.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async mettreAJourPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'payments')
    const existant = await this.daoTransactionPaiement.rechercherParId(paiementId)
    this.exigerEntiteAdmin(existant, 'Paiement introuvable')
    const avant = this.mapperPaiementEnDto(existant)
    const fusion = this.versObjet({ ...avant, ...corps, id: paiementId })
    const paiement = this.construireEntitePaiementDepuisCorps(fusion, paiementId)
    await this.daoTransactionPaiement.sauvegarder(paiement)
    this.statutsPaiement.set(paiement.id, this.normaliserStatutMouvement(fusion.status))
    const dto = this.mapperPaiementEnDto(paiement)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'payments',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      avant,
      apres: dto,
      resourceId: paiement.id,
      path: `/payments/${paiement.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async supprimerPaiement(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ): Promise<TypeResultatMutationAdministration<{ ok: true }>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'payments')
    const existant = await this.daoTransactionPaiement.rechercherParId(paiementId)
    this.exigerEntiteAdmin(existant, 'Paiement introuvable')
    const avant = this.mapperPaiementEnDto(existant)
    await this.daoTransactionPaiement.supprimerParId(paiementId)
    this.statutsPaiement.delete(paiementId)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'payments',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      avant,
      resourceId: paiementId,
      path: `/payments/${paiementId}`,
    })
    return { donnees: { ok: true }, annulation }
  }

  public async listerDepots(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'deposits')
    return (await this.daoPaiementCaution.lister()).map((element) => this.mapperDepotEnDto(element))
  }

  public async obtenirDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    depotId: string
  ): Promise<Record<string, unknown>> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'deposits')
    const depot = await this.daoPaiementCaution.rechercherParId(depotId)
    this.exigerEntiteAdmin(depot, 'Depot introuvable')
    return this.mapperDepotEnDto(depot)
  }

  public async creerDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'deposits')
    const depot = this.construireEntiteDepotDepuisCorps(corps)
    await this.daoPaiementCaution.sauvegarder(depot)
    this.statutsDepot.set(depot.id, this.normaliserStatutMouvement(corps.status))
    const dto = this.mapperDepotEnDto(depot)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'deposits',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      apres: dto,
      resourceId: depot.id,
      path: `/deposits/${depot.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async mettreAJourDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    depotId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'deposits')
    const existant = await this.daoPaiementCaution.rechercherParId(depotId)
    this.exigerEntiteAdmin(existant, 'Depot introuvable')
    const avant = this.mapperDepotEnDto(existant)
    const fusion = this.versObjet({ ...avant, ...corps, id: depotId })
    const depot = this.construireEntiteDepotDepuisCorps(fusion, depotId)
    await this.daoPaiementCaution.sauvegarder(depot)
    this.statutsDepot.set(depot.id, this.normaliserStatutMouvement(fusion.status))
    const dto = this.mapperDepotEnDto(depot)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'deposits',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      avant,
      apres: dto,
      resourceId: depot.id,
      path: `/deposits/${depot.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async supprimerDepot(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    depotId: string
  ): Promise<TypeResultatMutationAdministration<{ ok: true }>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'deposits')
    const existant = await this.daoPaiementCaution.rechercherParId(depotId)
    this.exigerEntiteAdmin(existant, 'Depot introuvable')
    const avant = this.mapperDepotEnDto(existant)
    await this.daoPaiementCaution.supprimerParId(depotId)
    this.statutsDepot.delete(depotId)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'deposits',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      avant,
      resourceId: depotId,
      path: `/deposits/${depotId}`,
    })
    return { donnees: { ok: true }, annulation }
  }

  public async listerTravaux(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'work_items')
    return (await this.daoItemTravail.lister()).map((item) => this.mapperTravailEnDto(item))
  }

  public async obtenirTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    travailId: string
  ): Promise<Record<string, unknown>> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'work_items')
    const travail = await this.daoItemTravail.rechercherParId(travailId)
    this.exigerEntiteAdmin(travail, 'Item de travail introuvable')
    return this.mapperTravailEnDto(travail)
  }

  public async creerTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'work_items')
    const entite = this.construireEntiteTravailDepuisCorps(corps)
    await this.daoItemTravail.sauvegarder(entite)
    const dto = this.mapperTravailEnDto(entite)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'work_items',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      apres: dto,
      resourceId: entite.id,
      path: `/work_items/${entite.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async mettreAJourTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    travailId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'work_items')
    const existant = await this.daoItemTravail.rechercherParId(travailId)
    this.exigerEntiteAdmin(existant, 'Item de travail introuvable')
    const avant = this.mapperTravailEnDto(existant)
    const fusion = { ...avant, ...corps, id: travailId }
    const entite = this.construireEntiteTravailDepuisCorps(fusion, travailId)
    await this.daoItemTravail.sauvegarder(entite)
    const dto = this.mapperTravailEnDto(entite)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'work_items',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      avant,
      apres: dto,
      resourceId: entite.id,
      path: `/work_items/${entite.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async supprimerTravail(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    travailId: string
  ): Promise<TypeResultatMutationAdministration<{ ok: true }>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'work_items')
    const existant = await this.daoItemTravail.rechercherParId(travailId)
    this.exigerEntiteAdmin(existant, 'Item de travail introuvable')
    const avant = this.mapperTravailEnDto(existant)
    await this.daoItemTravail.supprimerParId(travailId)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'work_items',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      avant,
      resourceId: travailId,
      path: `/work_items/${travailId}`,
    })
    return { donnees: { ok: true }, annulation }
  }

  public async listerParametres(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    cle?: string | null
  ): Promise<TypeEnregistrementParametre[]> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'settings')
    const index = this.obtenirIndexParametres(contexte.adminId)
    const elements = Array.from(index.values())
    if (!cle) return elements
    return elements.filter((element) => element.key === cle)
  }

  public async creerParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<TypeEnregistrementParametre>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'settings')
    const index = this.obtenirIndexParametres(contexte.adminId)
    const cle = String(corps.key || '').trim()
    const valeur = String(corps.value ?? '').trim()
    if (!cle) {
      throw new ExceptionAuthentificationValidation(t(ERRORS.PARAMETRES_INVALIDES), {
        champ: 'key',
      })
    }
    const id = String(corps.id || cle).trim() || cle
    const maintenant = new Date().toISOString()
    const precedent = index.get(id)
    const enregistrement: TypeEnregistrementParametre = {
      id,
      key: cle,
      value: valeur,
      createdAt: precedent?.createdAt || maintenant,
      updatedAt: maintenant,
    }
    index.set(id, enregistrement)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'settings',
      operation: precedent ? 'UPDATE' : 'CREATE',
      actorId: contexte.utilisateurId,
      avant: precedent || undefined,
      apres: enregistrement,
      resourceId: id,
      path: `/settings/${id}`,
    })
    return { donnees: enregistrement, annulation }
  }

  public async mettreAJourParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    parametreId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<TypeEnregistrementParametre>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'settings')
    const index = this.obtenirIndexParametres(contexte.adminId)
    const existant = index.get(parametreId)
    this.exigerEntiteAdmin(existant, 'Parametre introuvable')
    const avant = { ...existant }
    const cle = String(corps.key || existant.key).trim()
    const valeur = String(corps.value ?? existant.value).trim()
    const suivant: TypeEnregistrementParametre = {
      id: parametreId,
      key: cle,
      value: valeur,
      createdAt: existant.createdAt,
      updatedAt: new Date().toISOString(),
    }
    index.set(parametreId, suivant)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'settings',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      avant,
      apres: suivant,
      resourceId: parametreId,
      path: `/settings/${parametreId}`,
    })
    return { donnees: suivant, annulation }
  }

  public async supprimerParametre(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    parametreId: string
  ): Promise<TypeResultatMutationAdministration<{ ok: true }>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'settings')
    const index = this.obtenirIndexParametres(contexte.adminId)
    const existant = index.get(parametreId)
    this.exigerEntiteAdmin(existant, 'Parametre introuvable')
    index.delete(parametreId)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'settings',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      avant: existant,
      resourceId: parametreId,
      path: `/settings/${parametreId}`,
    })
    return { donnees: { ok: true }, annulation }
  }

  public async listerImports(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'import_runs')
    return (await this.daoExecutionImport.lister()).map((element) => this.mapperExecutionImportEnDto(element))
  }

  public async obtenirImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    importId: string
  ): Promise<Record<string, unknown>> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'import_runs')
    const execution = await this.daoExecutionImport.rechercherParId(importId)
    this.exigerEntiteAdmin(execution, 'Execution import introuvable')
    return this.mapperExecutionImportEnDto(execution)
  }

  public async creerImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'import_runs')
    const entite = this.construireEntiteImportDepuisCorps(corps, contexte.adminId)
    await this.daoExecutionImport.sauvegarder(entite)
    const dto = this.mapperExecutionImportEnDto(entite)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'import_runs',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      apres: dto,
      resourceId: entite.id,
      path: `/import_runs/${entite.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async mettreAJourImport(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    importId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'import_runs')
    const existant = await this.daoExecutionImport.rechercherParId(importId)
    this.exigerEntiteAdmin(existant, 'Execution import introuvable')
    const avant = this.mapperExecutionImportEnDto(existant)
    const fusion = { ...avant, ...corps, id: importId, adminId: avant.adminId || contexte.adminId }
    const entite = this.construireEntiteImportDepuisCorps(fusion, String(fusion.adminId || contexte.adminId), importId)
    await this.daoExecutionImport.sauvegarder(entite)
    const dto = this.mapperExecutionImportEnDto(entite)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'import_runs',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      avant,
      apres: dto,
      resourceId: entite.id,
      path: `/import_runs/${entite.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async listerNotifications(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    utilisateurId?: string | null,
    champTri?: string | null,
    ordreTri?: string | null
  ): Promise<Record<string, unknown>[]> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'notifications')
    const cibleUtilisateurId = String(utilisateurId || contexte.utilisateurId)
    const elements = (await this.daoNotification.lister())
      .filter((notification) => notification.utilisateurId === cibleUtilisateurId)
      .map((notification) => this.mapperNotificationEnDto(notification))
    return this.trierElements(elements, champTri, ordreTri)
  }

  public async marquerNotificationLue(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    notificationId: string
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'notifications')
    const notification = await this.daoNotification.rechercherParId(notificationId)
    this.exigerEntiteAdmin(notification, 'Notification introuvable')
    if (notification.utilisateurId !== contexte.utilisateurId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }
    const avant = this.mapperNotificationEnDto(notification)
    notification.marquerCommeLue()
    await this.daoNotification.sauvegarder(notification)
    const dto = this.mapperNotificationEnDto(notification)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'notifications',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      avant,
      apres: dto,
      resourceId: notificationId,
      path: `/notifications/${notificationId}`,
    })
    return { donnees: dto, annulation }
  }

  public async listerActionsAnnulation(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    limite: number
  ): Promise<TypeMetadonneesActionAnnulationAdministrationAdmin[]> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'undo-actions')
    const maintenant = Date.now()
    const limiteProtegee = Math.max(1, Math.min(100, limite))
    const elements = Array.from(this.actionsAnnulation.values())
      .filter((action) => {
        const expireLe = new Date(action.metadonnees.expiresAt).getTime()
        if (!Number.isFinite(expireLe) || expireLe <= maintenant) return false
        return action.metadonnees.actorId === contexte.utilisateurId
      })
      .sort(
        (a, b) =>
          new Date(b.metadonnees.createdAt).getTime() - new Date(a.metadonnees.createdAt).getTime()
      )
      .slice(0, limiteProtegee)
      .map((action) => action.metadonnees)

    return elements
  }

  public async annulerAction(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    actionId: string
  ): Promise<{ ok: true; rolledBackId: string }> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'undo-actions')
    const action = this.actionsAnnulation.get(actionId)
    this.exigerEntiteAdmin(action, 'Action annulation introuvable')
    if (action.metadonnees.actorId !== contexte.utilisateurId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }
    const expireLe = new Date(action.metadonnees.expiresAt).getTime()
    if (!Number.isFinite(expireLe) || expireLe <= Date.now()) {
      this.actionsAnnulation.delete(actionId)
      throw new ErreurHttp(CODE_HTTP.CONFLIT, 'Rollback expiré (plus de 2 mois)')
    }

    await this.appliquerRollback(action)
    this.actionsAnnulation.delete(actionId)
    return { ok: true, rolledBackId: actionId }
  }

  public async listerPaiementsAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    return (await this.daoPaiementAbonnementAdmin.lister())
      .filter((paiement) => paiement.adminId === contexte.adminId)
      .map((paiement) => this.mapperPaiementAdminEnDto(paiement))
  }

  public async obtenirPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ): Promise<Record<string, unknown>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    const paiement = await this.daoPaiementAbonnementAdmin.rechercherParId(paiementId)
    this.exigerEntiteAdmin(paiement, 'Paiement admin introuvable')
    if (paiement.adminId !== contexte.adminId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }
    return this.mapperPaiementAdminEnDto(paiement)
  }

  public async creerPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    const fusion = { ...corps, adminId: String(corps.adminId || contexte.adminId) }
    const entite = this.construireEntitePaiementAdminDepuisCorps(fusion)
    if (entite.adminId !== contexte.adminId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }
    await this.daoPaiementAbonnementAdmin.sauvegarder(entite)
    const dto = this.mapperPaiementAdminEnDto(entite)
    await this.mettreAJourStatutDepuisPaiementAdmin(entite)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'admin_payments',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      apres: dto,
      resourceId: entite.id,
      path: `/admin_payments/${entite.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async mettreAJourPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    const existant = await this.daoPaiementAbonnementAdmin.rechercherParId(paiementId)
    this.exigerEntiteAdmin(existant, 'Paiement admin introuvable')
    if (existant.adminId !== contexte.adminId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    const avant = this.mapperPaiementAdminEnDto(existant)
    const fusion = this.versObjet({ ...avant, ...corps, id: paiementId, adminId: contexte.adminId })
    const entite = this.construireEntitePaiementAdminDepuisCorps(fusion, paiementId)
    await this.daoPaiementAbonnementAdmin.sauvegarder(entite)
    await this.mettreAJourStatutDepuisPaiementAdmin(entite)
    const dto = this.mapperPaiementAdminEnDto(entite)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'admin_payments',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      avant,
      apres: dto,
      resourceId: entite.id,
      path: `/admin_payments/${entite.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async supprimerPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    paiementId: string
  ): Promise<TypeResultatMutationAdministration<{ ok: true }>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    const existant = await this.daoPaiementAbonnementAdmin.rechercherParId(paiementId)
    this.exigerEntiteAdmin(existant, 'Paiement admin introuvable')
    if (existant.adminId !== contexte.adminId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }
    const avant = this.mapperPaiementAdminEnDto(existant)
    await this.daoPaiementAbonnementAdmin.supprimerParId(paiementId)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'admin_payments',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      avant,
      resourceId: paiementId,
      path: `/admin_payments/${paiementId}`,
    })
    return { donnees: { ok: true }, annulation }
  }

  public async obtenirStatutPaiementAdmin(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    adminIdRequete?: string | null
  ): Promise<Record<string, unknown>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'admin_payments')
    const adminId = String(adminIdRequete || contexte.adminId)
    if (adminId !== contexte.adminId) {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }
    const existant = await this.daoStatutAbonnementAdmin.rechercherParId(adminId)
    const statut = existant || (await this.creerStatutAbonnementParDefaut(adminId))
    return this.mapperStatutPaiementAdminEnDto(statut)
  }

  public async listerJournauxAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ): Promise<Record<string, unknown>[]> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'audit_logs')
    const elements = (await this.daoJournalAudit.lister()).map((element) =>
      this.mapperJournalAuditEnDto(element)
    )
    return this.trierElements(elements, champTri, ordreTri)
  }

  public async obtenirJournalAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    journalId: string
  ): Promise<Record<string, unknown>> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'audit_logs')
    const journal = await this.daoJournalAudit.rechercherParId(journalId)
    this.exigerEntiteAdmin(journal, 'Journal audit introuvable')
    return this.mapperJournalAuditEnDto(journal)
  }

  public async creerJournalAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'audit_logs')
    const journal = this.construireEntiteJournalAuditDepuisCorps(corps)
    await this.daoJournalAudit.sauvegarder(journal)
    const dto = this.mapperJournalAuditEnDto(journal)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'audit_logs',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      apres: dto,
      resourceId: journal.id,
      path: `/audit_logs/${journal.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async supprimerJournalAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    journalId: string
  ): Promise<TypeResultatMutationAdministration<{ ok: true }>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'audit_logs')
    const journal = await this.daoJournalAudit.rechercherParId(journalId)
    this.exigerEntiteAdmin(journal, 'Journal audit introuvable')
    const avant = this.mapperJournalAuditEnDto(journal)
    await this.daoJournalAudit.supprimerParId(journalId)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'audit_logs',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      avant,
      resourceId: journalId,
      path: `/audit_logs/${journalId}`,
    })
    return { donnees: { ok: true }, annulation }
  }

  public async listerIpsBloquees(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ): Promise<Record<string, unknown>[]> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'blocked_ips')
    const elements = (await this.daoIpBloquee.lister()).map((element) => this.mapperIpBloqueeEnDto(element))
    return this.trierElements(elements, champTri, ordreTri)
  }

  public async obtenirIpBloquee(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    ipId: string
  ): Promise<Record<string, unknown>> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'blocked_ips')
    const entite = await this.daoIpBloquee.rechercherParId(ipId)
    this.exigerEntiteAdmin(entite, 'IP bloquee introuvable')
    return this.mapperIpBloqueeEnDto(entite)
  }

  public async bloquerIp(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministration<Record<string, unknown>>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'blocked_ips')
    const entite = this.construireEntiteIpBloqueeDepuisCorps(corps)
    await this.daoIpBloquee.sauvegarder(entite)
    const dto = this.mapperIpBloqueeEnDto(entite)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'blocked_ips',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      apres: dto,
      resourceId: entite.id,
      path: `/blocked_ips/${entite.id}`,
    })
    return { donnees: dto, annulation }
  }

  public async debloquerIp(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    ipId: string
  ): Promise<TypeResultatMutationAdministration<{ ok: true }>> {
    const contexte = await this.obtenirContexteAcces(jetonAcces, impersonation, 'blocked_ips')
    const entite = await this.daoIpBloquee.rechercherParId(ipId)
    this.exigerEntiteAdmin(entite, 'IP bloquee introuvable')
    const avant = this.mapperIpBloqueeEnDto(entite)
    await this.daoIpBloquee.supprimerParId(ipId)
    const annulation = this.enregistrerActionAnnulation({
      ressource: 'blocked_ips',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      avant,
      resourceId: ipId,
      path: `/blocked_ips/${ipId}`,
    })
    return { donnees: { ok: true }, annulation }
  }

  public async ouvrirUrlCloudinary(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    url: string
  ): Promise<{ url: string }> {
    await this.obtenirContexteAcces(jetonAcces, impersonation, 'cloudinary')
    const cible = String(url || '').trim()
    if (!cible) return { url: '' }
    return { url: cible }
  }

  private async obtenirContexteAcces(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    ressource: TypeRessourceAdministrationAdmin
  ): Promise<TypeContexteAccesAdministrationAdmin> {
    const contexteSession = await this.serviceAuthentification.obtenirContexteDepuisJetonAcces(jetonAcces)
    const utilisateur = contexteSession.utilisateur
    const role = String(utilisateur.role || '').toUpperCase()
    const impersonationActive = role === 'SUPER_ADMIN' && Boolean(impersonation?.adminId)
    let adminId = ''

    if (role === 'ADMIN') {
      adminId = utilisateur.id
    } else if (impersonationActive) {
      await this.serviceAuthentification.exigerSecondeAuthSuperAdmin(jetonAcces)
      adminId = String(impersonation?.adminId || '').trim()
    } else {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    const permissions = Array.isArray(utilisateur.permissions)
      ? utilisateur.permissions
      : []

    const contexte: TypeContexteAccesAdministrationAdmin = {
      utilisateurId: utilisateur.id,
      role,
      permissions,
      superAdminSecondAuthRequired: Boolean(utilisateur.superAdminSecondAuthRequired),
      adminId,
      impersonationActive,
    }

    this.exigerPermission(contexte, ressource)
    return contexte
  }

  private exigerPermission(
    contexte: TypeContexteAccesAdministrationAdmin,
    ressource: TypeRessourceAdministrationAdmin
  ): void {
    if (contexte.role === 'SUPER_ADMIN' && contexte.impersonationActive) {
      return
    }
    const permissionRequise = CODES_PERMISSIONS_RESSOURCES_ADMIN[ressource]
    if (!permissionRequise) return
    const permissions = new Set(contexte.permissions)
    if (!permissions.has(permissionRequise)) {
      throw new ExceptionAuthentificationAutorisation(
        t(ERRORS.AUTH_PERMISSION_MANQUANTE),
        { permission: permissionRequise }
      )
    }
  }

  private estClientVisibleParAdmin(client: EntiteClient, adminId: string): boolean {
    return String(client.adminId || '').trim() === String(adminId || '').trim()
  }

  private construireEntiteClientDepuisCorps(
    corps: Record<string, unknown>,
    adminId: string,
    idForce?: string
  ): EntiteClient {
    const locations = this.extraireLocationsDepuisCorps(corps, idForce)
    const builder = new BuilderEntiteClient()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecPrenom(String(corps.firstName || corps.prenom || ''))
      .avecNom(String(corps.lastName || corps.nom || ''))
      .avecTelephone(String(corps.phone || corps.telephone || ''))
      .avecCni(String(corps.cni || '1000000000000'))
      .avecAdminId(adminId)
      .avecStatut(this.normaliserStatutClient(corps.status))
      .avecDateCreation(this.versDate(corps.createdAt))
      .avecLocations(locations)

    const email = this.versTexteOptionnel(corps.email)
    if (email) {
      builder.avecEmail(email)
    }

    return builder.construire()
  }

  private extraireLocationsDepuisCorps(corps: Record<string, unknown>, clientIdForce?: string): EntiteClient['locations'] {
    const idClient = String(clientIdForce || corps.id || '')
    const locationsBrutes = Array.isArray(corps.rentals) ? corps.rentals : []
    return locationsBrutes.map((location) => this.construireEntiteLocationDepuisCorps(this.versObjet(location), idClient))
  }

  private construireEntiteLocationDepuisCorps(
    corps: Record<string, unknown>,
    clientId: string
  ): EntiteLocation {
    const documents = Array.isArray(corps.documents)
      ? corps.documents.map((document) => this.construireEntiteDocumentDepuisCorps(this.versObjet(document)))
      : []
    const paiements = Array.isArray(corps.payments)
      ? corps.payments.map((paiement) => this.construireEntitePaiementMensuelDepuisCorps(this.versObjet(paiement), String(corps.id || randomUUID())))
      : []

    const cautionBrute = this.versObjet(corps.deposit)
    const paiementsCaution = Array.isArray(cautionBrute.payments)
      ? cautionBrute.payments.map((paiement) =>
          this.construireEntitePaiementCautionDepuisCorps(this.versObjet(paiement))
        )
      : []

    return new BuilderEntiteLocation()
      .avecId(String(corps.id || randomUUID()))
      .avecClientId(clientId)
      .avecTypeBien(this.normaliserTypeBien(corps.propertyType))
      .avecNomBien(String(corps.propertyName || 'Bien inconnu'))
      .avecLoyerMensuel(this.versNombre(corps.monthlyRent))
      .avecDateDebut(this.versDate(corps.startDate))
      .avecCaution(
        new BuilderEntiteCaution()
          .avecMontantTotal(this.versNombre(cautionBrute.total))
          .avecMontantPaye(this.versNombre(cautionBrute.paid))
          .avecPaiements(paiementsCaution)
          .construire()
      )
      .avecPaiementsMensuels(paiements)
      .avecDocuments(documents)
      .construire()
  }

  private construireEntitePaiementMensuelDepuisCorps(
    corps: Record<string, unknown>,
    locationId: string
  ): EntitePaiementMensuel {
    const transactions = Array.isArray(corps.payments)
      ? corps.payments.map((transaction) =>
          this.construireEntitePaiementDepuisCorps({
            ...this.versObjet(transaction),
            id: this.versObjet(transaction).id || randomUUID(),
          })
        )
      : []

    return new BuilderEntitePaiementMensuel()
      .avecId(String(corps.id || randomUUID()))
      .avecLocationId(locationId)
      .avecPeriodeDebut(this.versDate(corps.periodStart))
      .avecPeriodeFin(this.versDate(corps.periodEnd))
      .avecDateEcheance(this.versDate(corps.dueDate))
      .avecMontantDu(this.versNombre(corps.amount))
      .avecMontantPaye(this.versNombre(corps.paidAmount))
      .avecStatut(this.normaliserStatutPaiementMensuel(corps.status))
      .avecTransactions(transactions)
      .construire()
  }

  private construireEntiteDocumentDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteDocument {
    return new BuilderEntiteDocument()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecNom(String(corps.name || corps.nom || 'Document'))
      .avecType(this.normaliserTypeDocument(corps.type))
      .avecUrl(String(corps.url || 'https://example.com/document'))
      .avecDateAjout(this.versDate(corps.uploadedAt || corps.dateAjout))
      .avecEstSigne(Boolean(corps.signed ?? corps.estSigne))
      .construire()
  }

  private construireEntitePaiementDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteTransactionPaiement {
    return new BuilderEntiteTransactionPaiement()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecMontant(this.versNombre(corps.amount || corps.montant))
      .avecDatePaiement(this.versDate(corps.date || corps.datePaiement))
      .avecNumeroRecu(
        String(corps.receiptNumber || corps.numeroRecu || corps.receiptId || `REC-${Date.now()}`)
      )
      .avecDescription(this.versTexteOptionnel(corps.description || corps.notes) || '')
      .construire()
  }

  private construireEntiteDepotDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntitePaiementCaution {
    return new BuilderEntitePaiementCaution()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecMontant(this.versNombre(corps.amount || corps.montant))
      .avecDatePaiement(this.versDate(corps.date || corps.datePaiement))
      .avecNumeroRecu(
        String(corps.receiptNumber || corps.numeroRecu || corps.receiptId || `DEP-${Date.now()}`)
      )
      .avecNote(this.versTexteOptionnel(corps.description || corps.notes) || '')
      .construire()
  }

  private construireEntitePaiementCautionDepuisCorps(corps: Record<string, unknown>): EntitePaiementCaution {
    return this.construireEntiteDepotDepuisCorps(corps)
  }

  private construireEntiteTravailDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteItemTravail {
    const builder = new BuilderEntiteItemTravail()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecTitre(String(corps.title || corps.titre || 'Travail'))
      .avecDescription(String(corps.description || ''))
      .avecPriorite(this.normaliserPriorite(corps.priority || corps.priorite))
      .avecStatut(this.normaliserStatutTravail(corps.status || corps.statut))
      .avecDateCreation(this.versDate(corps.createdAt || corps.creeLe))
      .avecDetecteAutomatiquement(Boolean(corps.detectedAutomatically || corps.detecteAutomatiquement))

    const dateEcheance = this.versDateOptionnelle(corps.dueDate || corps.dateEcheance)
    if (dateEcheance) {
      builder.avecDateEcheance(dateEcheance)
    }

    return builder.construire()
  }

  private construireEntiteImportDepuisCorps(
    corps: Record<string, unknown>,
    adminId: string,
    idForce?: string
  ): EntiteExecutionImport {
    const erreurs = Array.isArray(corps.errors)
      ? corps.errors.map((erreur) =>
          new BuilderEntiteErreurImport()
            .avecNumeroLigne(this.versNombreEntier(this.versObjet(erreur).rowNumber, 1))
            .avecErreurs(Array.isArray(this.versObjet(erreur).errors) ? (this.versObjet(erreur).errors as string[]) : [])
            .avecDonneesBrutes(this.versObjet(this.versObjet(erreur).parsed))
            .construire()
        )
      : []

    const inserted = Array.isArray(corps.inserted)
      ? corps.inserted.map((ligne) => {
          const objet = this.versObjet(ligne)
          return {
            id: String(objet.id || randomUUID()),
            prenom: String(objet.firstName || objet.prenom || ''),
            nom: String(objet.lastName || objet.nom || ''),
            telephone: String(objet.phone || objet.telephone || ''),
            email: this.versTexteOptionnel(objet.email),
          }
        })
      : []

    return new BuilderEntiteExecutionImport()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecAdminId(String(corps.adminId || adminId))
      .avecNomFichier(String(corps.fileName || corps.nomFichier || 'import.xlsx'))
      .avecNombreLignesTotal(this.versNombreEntier(corps.totalRows || corps.nombreLignesTotal, 0))
      .avecLignesInserees(inserted)
      .avecErreurs(erreurs)
      .avecIgnoree(Boolean(corps.ignored || corps.ignoree))
      .avecLectureReussie(Boolean(corps.readSuccess ?? corps.lectureReussie ?? true))
      .avecLectureAvecErreurs(Boolean(corps.readErrors ?? corps.lectureAvecErreurs ?? false))
      .avecDateCreation(this.versDate(corps.createdAt || corps.creeLe))
      .avecDateMiseAJour(this.versDate(corps.updatedAt || corps.misAJourLe))
      .construire()
  }

  private construireEntitePaiementAdminDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntitePaiementAbonnementAdmin {
    return new BuilderEntitePaiementAbonnementAdmin()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecAdminId(String(corps.adminId || ''))
      .avecEntrepriseId(this.versTexteOptionnel(corps.entrepriseId) || '')
      .avecMontant(this.versNombre(corps.amount || corps.montant))
      .avecMethode(this.normaliserMethodePaiementAdmin(corps.method || corps.methode))
      .avecMois(String(corps.month || corps.mois || this.moisCourant()))
      .avecStatut(this.normaliserStatutPaiementAdmin(corps.status || corps.statut))
      .avecFournisseur(this.normaliserFournisseurPaiement(corps.provider || corps.fournisseur))
      .avecReferenceFournisseur(this.versTexteOptionnel(corps.providerReference || corps.referenceFournisseur) || '')
      .avecUrlPaiement(this.versTexteOptionnel(corps.checkoutUrl || corps.urlPaiement) || '')
      .avecTelephonePayeur(this.versTexteOptionnel(corps.payerPhone || corps.telephonePayeur) || '')
      .avecReferenceTransaction(this.versTexteOptionnel(corps.transactionRef || corps.referenceTransaction) || '')
      .avecNote(this.versTexteOptionnel(corps.note) || '')
      .avecPayeLe(this.versDateOptionnelle(corps.paidAt || corps.payeLe))
      .avecApprouveLe(this.versDateOptionnelle(corps.approvedAt || corps.approuveLe))
      .avecApprouvePar(this.versTexteOptionnel(corps.approvedBy || corps.approuvePar) || null)
      .avecModeAbonnement(this.normaliserModeAbonnement(corps.subscriptionMode || corps.modeAbonnement))
      .avecDateCreation(this.versDate(corps.createdAt || corps.creeLe))
      .construire()
  }

  private construireEntiteNotificationDepuisCorps(
    corps: Record<string, unknown>,
    utilisateurIdParDefaut: string,
    idForce?: string
  ): EntiteNotification {
    return new BuilderEntiteNotification()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecUtilisateurId(String(corps.user_id || corps.utilisateurId || utilisateurIdParDefaut))
      .avecMessage(String(corps.message || 'Notification'))
      .avecType(this.versTexteOptionnel(corps.type) || '')
      .avecEstLue(Boolean(corps.is_read || corps.estLue))
      .avecDateCreation(this.versDate(corps.created_at || corps.creeLe))
      .construire()
  }

  private construireEntiteJournalAuditDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteJournalAudit {
    return new BuilderEntiteJournalAudit()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecActeur(this.versTexteOptionnel(corps.actor || corps.acteur) || '')
      .avecAction(this.versTexteOptionnel(corps.action) || '')
      .avecTypeCible(this.versTexteOptionnel(corps.targetType || corps.typeCible) || '')
      .avecIdCible(this.versTexteOptionnel(corps.targetId || corps.idCible) || '')
      .avecMessage(this.versTexteOptionnel(corps.message) || '')
      .avecAdresseIp(this.versTexteOptionnel(corps.ipAddress || corps.adresseIp) || '')
      .avecDateCreation(this.versDate(corps.createdAt || corps.creeLe))
      .construire()
  }

  private construireEntiteIpBloqueeDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteIpBloquee {
    return new BuilderEntiteIpBloquee()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecAdresseIp(String(corps.ip || corps.adresseIp || ''))
      .avecRaison(this.versTexteOptionnel(corps.reason || corps.raison) || '')
      .avecDateCreation(this.versDate(corps.createdAt || corps.creeLe))
      .construire()
  }

  private mapperClientEnDto(client: EntiteClient): Record<string, unknown> {
    return {
      id: client.id,
      adminId: client.adminId,
      firstName: client.prenom,
      lastName: client.nom,
      phone: client.telephone,
      email: client.email,
      cni: client.cni,
      status: client.statut,
      createdAt: client.creeLe.toISOString(),
      rentals: client.locations.map((location) => ({
        id: location.id,
        clientId: location.clientId,
        propertyType: location.typeBien,
        propertyName: location.nomBien,
        monthlyRent: location.loyerMensuel,
        startDate: location.dateDebut.toISOString(),
        deposit: {
          total: location.caution.montantTotal,
          paid: location.caution.montantPaye,
          payments: location.caution.paiements.map((paiement) => this.mapperDepotEnDto(paiement)),
        },
        payments: location.paiementsMensuels.map((paiement) => ({
          id: paiement.id,
          rentalId: paiement.locationId,
          periodStart: paiement.periodeDebut.toISOString(),
          periodEnd: paiement.periodeFin.toISOString(),
          dueDate: paiement.dateEcheance.toISOString(),
          amount: paiement.montantDu,
          paidAmount: paiement.montantPaye,
          status: paiement.statut,
          payments: paiement.transactions.map((transaction) => this.mapperPaiementEnDto(transaction)),
        })),
        documents: location.documents.map((document) => this.mapperDocumentEnDto(document)),
      })),
    }
  }

  private mapperDocumentEnDto(document: EntiteDocument): Record<string, unknown> {
    return {
      id: document.id,
      name: document.nom,
      type: document.type,
      url: document.url,
      uploadedAt: document.dateAjout.toISOString(),
      signed: document.estSigne,
    }
  }

  private mapperPaiementEnDto(paiement: EntiteTransactionPaiement): Record<string, unknown> {
    return {
      id: paiement.id,
      amount: paiement.montant,
      date: paiement.datePaiement.toISOString(),
      receiptNumber: paiement.numeroRecu,
      description: paiement.description || '',
      status: this.statutsPaiement.get(paiement.id) || 'completed',
    }
  }

  private mapperDepotEnDto(depot: EntitePaiementCaution): Record<string, unknown> {
    return {
      id: depot.id,
      amount: depot.montant,
      date: depot.datePaiement.toISOString(),
      receiptNumber: depot.numeroRecu,
      description: depot.note || '',
      status: this.statutsDepot.get(depot.id) || 'completed',
    }
  }

  private mapperTravailEnDto(travail: EntiteItemTravail): Record<string, unknown> {
    return {
      id: travail.id,
      title: travail.titre,
      description: travail.description,
      status: this.mapperStatutTravailSortie(travail.statut),
      priority: travail.priorite,
      createdAt: travail.creeLe.toISOString(),
      dueDate: travail.dateEcheance?.toISOString(),
      detectedAutomatically: travail.detecteAutomatiquement,
    }
  }

  private mapperExecutionImportEnDto(execution: EntiteExecutionImport): Record<string, unknown> {
    return {
      id: execution.id,
      adminId: execution.adminId,
      fileName: execution.nomFichier,
      totalRows: execution.nombreLignesTotal,
      inserted: execution.lignesInserees.map((ligne) => ({
        id: ligne.id,
        firstName: ligne.prenom,
        lastName: ligne.nom,
        phone: ligne.telephone,
        email: ligne.email,
      })),
      errors: execution.erreurs.map((erreur) => ({
        rowNumber: erreur.numeroLigne,
        errors: erreur.erreurs,
        parsed: erreur.donneesBrutes,
      })),
      ignored: execution.ignoree,
      readSuccess: execution.lectureReussie,
      readErrors: execution.lectureAvecErreurs,
      createdAt: execution.creeLe.toISOString(),
      updatedAt: execution.misAJourLe.toISOString(),
    }
  }

  private mapperNotificationEnDto(notification: EntiteNotification): Record<string, unknown> {
    return {
      id: notification.id,
      user_id: notification.utilisateurId,
      type: notification.type,
      message: notification.message,
      is_read: notification.estLue,
      created_at: notification.creeLe.toISOString(),
    }
  }

  private mapperPaiementAdminEnDto(paiement: EntitePaiementAbonnementAdmin): Record<string, unknown> {
    return {
      id: paiement.id,
      adminId: paiement.adminId,
      entrepriseId: paiement.entrepriseId,
      amount: paiement.montant,
      method: paiement.methode,
      status: paiement.statut,
      provider: paiement.fournisseur,
      providerReference: paiement.referenceFournisseur,
      checkoutUrl: paiement.urlPaiement,
      payerPhone: paiement.telephonePayeur,
      transactionRef: paiement.referenceTransaction,
      note: paiement.note,
      paidAt: paiement.payeLe ? paiement.payeLe.toISOString() : null,
      month: paiement.mois,
      approvedAt: paiement.approuveLe ? paiement.approuveLe.toISOString() : null,
      approvedBy: paiement.approuvePar,
      subscriptionMode: paiement.modeAbonnement,
      createdAt: paiement.creeLe.toISOString(),
    }
  }

  private mapperStatutPaiementAdminEnDto(statut: {
    adminId: string
    bloque: boolean
    moisEnRetard: string | null
    echeance: Date | null
    moisRequis: string
    moisCourant: string
    joursGrace: number
    modeAbonnement: string
    montantAttendu?: number
    autoriserMontantLibre: boolean
  }): Record<string, unknown> {
    return {
      adminId: statut.adminId,
      blocked: statut.bloque,
      overdueMonth: statut.moisEnRetard,
      dueAt: statut.echeance ? statut.echeance.toISOString() : null,
      requiredMonth: statut.moisRequis,
      currentMonth: statut.moisCourant,
      graceDays: statut.joursGrace,
      subscriptionMode: statut.modeAbonnement,
      expectedAmount: statut.montantAttendu,
      allowCustomAmount: statut.autoriserMontantLibre,
    }
  }

  private mapperJournalAuditEnDto(journal: EntiteJournalAudit): Record<string, unknown> {
    return {
      id: journal.id,
      actor: journal.acteur,
      action: journal.action,
      targetType: journal.typeCible,
      targetId: journal.idCible,
      message: journal.message,
      ipAddress: journal.adresseIp,
      createdAt: journal.creeLe.toISOString(),
    }
  }

  private mapperIpBloqueeEnDto(ip: EntiteIpBloquee): Record<string, unknown> {
    return {
      id: ip.id,
      ip: ip.adresseIp,
      reason: ip.raison,
      createdAt: ip.creeLe.toISOString(),
    }
  }

  private async creerStatutAbonnementParDefaut(adminId: string) {
    const mois = this.moisCourant()
    const entite = new BuilderEntiteStatutAbonnementAdmin()
      .avecAdminId(adminId)
      .avecBloque(false)
      .avecMoisEnRetard(null)
      .avecMoisRequis(mois)
      .avecMoisCourant(mois)
      .avecJoursGrace(5)
      .avecModeAbonnement('monthly')
      .avecMontantAttendu(5000)
      .avecAutoriserMontantLibre(false)
      .construire()
    await this.daoStatutAbonnementAdmin.sauvegarder(entite)
    return entite
  }

  private async mettreAJourStatutDepuisPaiementAdmin(paiement: EntitePaiementAbonnementAdmin): Promise<void> {
    const existant = await this.daoStatutAbonnementAdmin.rechercherParId(paiement.adminId)
    const courant = existant || (await this.creerStatutAbonnementParDefaut(paiement.adminId))
    const mode = paiement.modeAbonnement || courant.modeAbonnement
    const moisCourant = this.moisCourant()
    const estPaye = paiement.statut === 'paid'
    const suivant = new BuilderEntiteStatutAbonnementAdmin()
      .avecAdminId(courant.adminId)
      .avecBloque(!estPaye && paiement.mois <= moisCourant)
      .avecMoisEnRetard(estPaye ? null : paiement.mois)
      .avecEcheance(estPaye ? null : new Date())
      .avecMoisRequis(moisCourant)
      .avecMoisCourant(moisCourant)
      .avecJoursGrace(courant.joursGrace)
      .avecModeAbonnement(mode)
      .avecMontantAttendu(paiement.montant)
      .avecAutoriserMontantLibre(courant.autoriserMontantLibre)
      .construire()
    await this.daoStatutAbonnementAdmin.sauvegarder(suivant)
  }

  private obtenirIndexParametres(adminId: string): Map<string, TypeEnregistrementParametre> {
    const cle = String(adminId || '').trim()
    const existant = this.parametresParAdmin.get(cle)
    if (existant) return existant
    const nouveau = new Map<string, TypeEnregistrementParametre>()
    this.parametresParAdmin.set(cle, nouveau)
    return nouveau
  }

  private enregistrerActionAnnulation(parametres: {
    ressource: TypeRessourceAdministrationAdmin
    operation: TypeOperationAnnulation
    actorId: string
    resourceId?: string
    path?: string
    avant?: unknown
    apres?: unknown
  }): TypeMetadonneesActionAnnulationAdministrationAdmin {
    const id = randomUUID()
    const createdAt = new Date()
    const expiresAt = new Date(createdAt.getTime() + DUREE_ANNULATION_MILLISECONDES)

    const metadonnees: TypeMetadonneesActionAnnulationAdministrationAdmin = {
      id,
      resource: parametres.ressource,
      resourceId: parametres.resourceId || null,
      method: this.mapperOperationEnMethodeHttp(parametres.operation),
      actorId: parametres.actorId,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      path: parametres.path,
    }

    this.actionsAnnulation.set(id, {
      metadonnees,
      operation: parametres.operation,
      avant: parametres.avant,
      apres: parametres.apres,
    })

    return metadonnees
  }

  private mapperOperationEnMethodeHttp(operation: TypeOperationAnnulation): 'POST' | 'PUT' | 'PATCH' | 'DELETE' {
    if (operation === 'CREATE') return 'POST'
    if (operation === 'DELETE') return 'DELETE'
    return 'PATCH'
  }

  private async appliquerRollback(action: TypeActionAnnulationInterne): Promise<void> {
    const resourceId = String(action.metadonnees.resourceId || '')
    switch (action.metadonnees.resource as TypeRessourceAdministrationAdmin) {
      case 'clients':
        await this.appliquerRollbackClient(action, resourceId)
        return
      case 'documents':
        await this.appliquerRollbackDocument(action, resourceId)
        return
      case 'payments':
        await this.appliquerRollbackPaiement(action, resourceId)
        return
      case 'deposits':
        await this.appliquerRollbackDepot(action, resourceId)
        return
      case 'work_items':
        await this.appliquerRollbackTravail(action, resourceId)
        return
      case 'settings':
        this.appliquerRollbackParametre(action, resourceId)
        return
      case 'import_runs':
        await this.appliquerRollbackImport(action, resourceId)
        return
      case 'notifications':
        await this.appliquerRollbackNotification(action, resourceId)
        return
      case 'admin_payments':
        await this.appliquerRollbackPaiementAdmin(action, resourceId)
        return
      case 'audit_logs':
        await this.appliquerRollbackJournalAudit(action, resourceId)
        return
      case 'blocked_ips':
        await this.appliquerRollbackIpBloquee(action, resourceId)
        return
      default:
        throw new ErreurHttp(CODE_HTTP.MAUVAISE_REQUETE, t(ERRORS.PARAMETRES_INVALIDES))
    }
  }

  private async appliquerRollbackClient(action: TypeActionAnnulationInterne, clientId: string): Promise<void> {
    if (action.operation === 'CREATE') {
      await this.daoClient.supprimerParId(clientId)
      return
    }
    const source = this.versObjet(action.avant)
    const entite = this.construireEntiteClientDepuisCorps(source, String(source.adminId || ''), clientId)
    await this.daoClient.sauvegarder(entite)
  }

  private async appliquerRollbackDocument(action: TypeActionAnnulationInterne, documentId: string): Promise<void> {
    if (action.operation === 'CREATE') {
      await this.daoDocument.supprimerParId(documentId)
      return
    }
    const source = this.versObjet(action.avant)
    const entite = this.construireEntiteDocumentDepuisCorps(source, documentId)
    await this.daoDocument.sauvegarder(entite)
  }

  private async appliquerRollbackPaiement(action: TypeActionAnnulationInterne, paiementId: string): Promise<void> {
    if (action.operation === 'CREATE') {
      await this.daoTransactionPaiement.supprimerParId(paiementId)
      this.statutsPaiement.delete(paiementId)
      return
    }
    const source = this.versObjet(action.avant)
    const entite = this.construireEntitePaiementDepuisCorps(source, paiementId)
    await this.daoTransactionPaiement.sauvegarder(entite)
    this.statutsPaiement.set(entite.id, this.normaliserStatutMouvement(source.status))
  }

  private async appliquerRollbackDepot(action: TypeActionAnnulationInterne, depotId: string): Promise<void> {
    if (action.operation === 'CREATE') {
      await this.daoPaiementCaution.supprimerParId(depotId)
      this.statutsDepot.delete(depotId)
      return
    }
    const source = this.versObjet(action.avant)
    const entite = this.construireEntiteDepotDepuisCorps(source, depotId)
    await this.daoPaiementCaution.sauvegarder(entite)
    this.statutsDepot.set(entite.id, this.normaliserStatutMouvement(source.status))
  }

  private async appliquerRollbackTravail(action: TypeActionAnnulationInterne, travailId: string): Promise<void> {
    if (action.operation === 'CREATE') {
      await this.daoItemTravail.supprimerParId(travailId)
      return
    }
    const source = this.versObjet(action.avant)
    const entite = this.construireEntiteTravailDepuisCorps(source, travailId)
    await this.daoItemTravail.sauvegarder(entite)
  }

  private appliquerRollbackParametre(action: TypeActionAnnulationInterne, parametreId: string): void {
    const avant = this.versObjet(action.avant)
    const adminId = String(avant.adminId || action.metadonnees.actorId || '').trim()
    const index = this.obtenirIndexParametres(adminId)
    if (action.operation === 'CREATE') {
      index.delete(parametreId)
      return
    }
    index.set(parametreId, {
      id: String(avant.id || parametreId),
      key: String(avant.key || ''),
      value: String(avant.value || ''),
      createdAt: String(avant.createdAt || new Date().toISOString()),
      updatedAt: String(avant.updatedAt || new Date().toISOString()),
    })
  }

  private async appliquerRollbackImport(action: TypeActionAnnulationInterne, importId: string): Promise<void> {
    if (action.operation === 'CREATE') {
      await this.daoExecutionImport.supprimerParId(importId)
      return
    }
    const source = this.versObjet(action.avant)
    const entite = this.construireEntiteImportDepuisCorps(
      source,
      String(source.adminId || ''),
      importId
    )
    await this.daoExecutionImport.sauvegarder(entite)
  }

  private async appliquerRollbackNotification(
    action: TypeActionAnnulationInterne,
    notificationId: string
  ): Promise<void> {
    if (action.operation === 'CREATE') {
      await this.daoNotification.supprimerParId(notificationId)
      return
    }
    const source = this.versObjet(action.avant)
    const entite = this.construireEntiteNotificationDepuisCorps(
      source,
      String(source.user_id || source.utilisateurId || ''),
      notificationId
    )
    await this.daoNotification.sauvegarder(entite)
  }

  private async appliquerRollbackPaiementAdmin(
    action: TypeActionAnnulationInterne,
    paiementId: string
  ): Promise<void> {
    if (action.operation === 'CREATE') {
      await this.daoPaiementAbonnementAdmin.supprimerParId(paiementId)
      return
    }
    const source = this.versObjet(action.avant)
    const entite = this.construireEntitePaiementAdminDepuisCorps(source, paiementId)
    await this.daoPaiementAbonnementAdmin.sauvegarder(entite)
  }

  private async appliquerRollbackJournalAudit(
    action: TypeActionAnnulationInterne,
    journalId: string
  ): Promise<void> {
    if (action.operation === 'CREATE') {
      await this.daoJournalAudit.supprimerParId(journalId)
      return
    }
    const source = this.versObjet(action.avant)
    const entite = this.construireEntiteJournalAuditDepuisCorps(source, journalId)
    await this.daoJournalAudit.sauvegarder(entite)
  }

  private async appliquerRollbackIpBloquee(
    action: TypeActionAnnulationInterne,
    ipId: string
  ): Promise<void> {
    if (action.operation === 'CREATE') {
      await this.daoIpBloquee.supprimerParId(ipId)
      return
    }
    const source = this.versObjet(action.avant)
    const entite = this.construireEntiteIpBloqueeDepuisCorps(source, ipId)
    await this.daoIpBloquee.sauvegarder(entite)
  }

  private trierElements<T extends Record<string, unknown>>(
    elements: T[],
    champTri?: string | null,
    ordreTri?: string | null
  ): T[] {
    const champ = String(champTri || '').trim()
    if (!champ) return elements
    const ordre: TypeOrdreTri = String(ordreTri || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc'
    return [...elements].sort((a, b) => {
      const valeurA = this.valeurComparable(a[champ])
      const valeurB = this.valeurComparable(b[champ])
      if (valeurA < valeurB) return ordre === 'asc' ? -1 : 1
      if (valeurA > valeurB) return ordre === 'asc' ? 1 : -1
      return 0
    })
  }

  private valeurComparable(valeur: unknown): string | number {
    if (valeur instanceof Date) return valeur.getTime()
    if (typeof valeur === 'number') return valeur
    const texte = String(valeur || '')
    const date = Date.parse(texte)
    if (!Number.isNaN(date) && texte.includes('-')) return date
    return texte.toLowerCase()
  }

  private normaliserTypeBien(valeur: unknown): 'studio' | 'room' | 'apartment' | 'villa' | 'other' {
    const type = String(valeur || 'other').toLowerCase()
    if (type === 'studio' || type === 'room' || type === 'apartment' || type === 'villa') {
      return type
    }
    return 'other'
  }

  private normaliserTypeDocument(valeur: unknown): 'contract' | 'receipt' | 'other' {
    const type = String(valeur || 'other').toLowerCase()
    if (type === 'contract' || type === 'receipt' || type === 'other') return type
    return 'other'
  }

  private normaliserStatutClient(valeur: unknown): 'active' | 'archived' | 'blacklisted' {
    const statut = String(valeur || 'active').toLowerCase()
    if (statut === 'active' || statut === 'archived' || statut === 'blacklisted') return statut
    return 'active'
  }

  private normaliserStatutPaiementMensuel(valeur: unknown): 'paid' | 'partial' | 'unpaid' | 'late' {
    const statut = String(valeur || 'unpaid').toLowerCase()
    if (statut === 'paid' || statut === 'partial' || statut === 'unpaid' || statut === 'late') {
      return statut
    }
    return 'unpaid'
  }

  private normaliserPriorite(valeur: unknown): 'low' | 'medium' | 'high' {
    const priorite = String(valeur || 'medium').toLowerCase()
    if (priorite === 'low' || priorite === 'medium' || priorite === 'high') return priorite
    return 'medium'
  }

  private normaliserStatutTravail(valeur: unknown): 'pending' | 'in-progress' | 'completed' {
    const statut = String(valeur || 'pending').toLowerCase().replace('_', '-')
    if (statut === 'pending' || statut === 'in-progress' || statut === 'completed') return statut
    return 'pending'
  }

  private mapperStatutTravailSortie(valeur: string): 'pending' | 'in_progress' | 'completed' {
    if (valeur === 'in-progress') return 'in_progress'
    if (valeur === 'completed') return 'completed'
    return 'pending'
  }

  private normaliserMethodePaiementAdmin(valeur: unknown): 'wave' | 'orange_money' | 'cash' {
    const methode = String(valeur || 'wave').toLowerCase()
    if (methode === 'wave' || methode === 'orange_money' || methode === 'cash') return methode
    return 'wave'
  }

  private normaliserStatutPaiementAdmin(valeur: unknown): 'pending' | 'paid' | 'failed' | 'cancelled' {
    const statut = String(valeur || 'pending').toLowerCase()
    if (statut === 'pending' || statut === 'paid' || statut === 'failed' || statut === 'cancelled') {
      return statut
    }
    return 'pending'
  }

  private normaliserModeAbonnement(valeur: unknown): 'monthly' | 'premium' | 'annual' {
    const mode = String(valeur || 'monthly').toLowerCase()
    if (mode === 'monthly' || mode === 'premium' || mode === 'annual') return mode
    return 'monthly'
  }

  private normaliserFournisseurPaiement(
    valeur: unknown
  ): 'stripe' | 'wave' | 'orange' | 'manual' {
    const fournisseur = String(valeur || 'manual').toLowerCase()
    if (fournisseur === 'stripe' || fournisseur === 'wave' || fournisseur === 'orange' || fournisseur === 'manual') {
      return fournisseur
    }
    return 'manual'
  }

  private normaliserStatutMouvement(valeur: unknown): TypeStatutMouvement {
    const statut = String(valeur || 'completed').toLowerCase()
    if (statut === 'pending' || statut === 'completed' || statut === 'failed') return statut
    return 'completed'
  }

  private exigerEntiteAdmin<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }

  private versDate(valeur: unknown): Date {
    if (valeur instanceof Date && !Number.isNaN(valeur.getTime())) return valeur
    const date = new Date(String(valeur || ''))
    if (!Number.isNaN(date.getTime())) return date
    return new Date()
  }

  private versDateOptionnelle(valeur: unknown): Date | null {
    if (valeur === null || valeur === undefined || valeur === '') return null
    const date = this.versDate(valeur)
    if (Number.isNaN(date.getTime())) return null
    return date
  }

  private versNombre(valeur: unknown): number {
    const nombre = Number(valeur)
    if (!Number.isFinite(nombre)) return 0
    return nombre
  }

  private versNombreEntier(valeur: unknown, valeurParDefaut = 0): number {
    const nombre = Number(valeur)
    if (!Number.isFinite(nombre)) return valeurParDefaut
    return Math.floor(nombre)
  }

  private versTexteOptionnel(valeur: unknown): string | undefined {
    const texte = String(valeur || '').trim()
    return texte || undefined
  }

  private versObjet(valeur: unknown): Record<string, unknown> {
    if (valeur && typeof valeur === 'object' && !Array.isArray(valeur)) {
      return valeur as Record<string, unknown>
    }
    return {}
  }

  private moisCourant(): string {
    const date = new Date()
    const mois = String(date.getUTCMonth() + 1).padStart(2, '0')
    return `${date.getUTCFullYear()}-${mois}`
  }
}
