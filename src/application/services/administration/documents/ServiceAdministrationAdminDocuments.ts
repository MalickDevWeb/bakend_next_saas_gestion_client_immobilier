import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import type { TypeDependancesServiceAdministrationAdminDocuments } from '@/src/application/types/administration/documents/TypeDependancesServiceAdministrationAdminDocuments'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

export class ServiceAdministrationAdminDocuments {
  constructor(private readonly dependances: TypeDependancesServiceAdministrationAdminDocuments) {}

  public async listerDocuments(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation
  ): Promise<Record<string, unknown>[]> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'documents')
    return (await this.dependances.daoDocument.lister()).map((element) =>
      this.dependances.mappeur.mapperDocumentEnDto(element)
    )
  }

  public async obtenirDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    documentId: string
  ): Promise<Record<string, unknown>> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'documents')
    const document = await this.dependances.daoDocument.rechercherParId(documentId)
    this.exigerEntite(document, t(ERRORS.ADMIN_DOCUMENT_INTROUVABLE))
    return this.dependances.mappeur.mapperDocumentEnDto(document)
  }

  public async creerDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'documents')
    const document = this.dependances.constructeur.construireEntiteDocumentDepuisCorps(corps)
    await this.dependances.daoDocument.sauvegarder(document)

    const dto = this.dependances.mappeur.mapperDocumentEnDto(document)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'documents',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: document.id,
      path: `/documents/${document.id}`,
      executerRollback: async () => {
        await this.dependances.daoDocument.supprimerParId(document.id)
      },
    })

    return { donnees: dto, annulation }
  }

  public async mettreAJourDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    documentId: string,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'documents')
    const existant = await this.dependances.daoDocument.rechercherParId(documentId)
    this.exigerEntite(existant, t(ERRORS.ADMIN_DOCUMENT_INTROUVABLE))

    const avantEntite = existant
    const fusion = { ...this.dependances.mappeur.mapperDocumentEnDto(existant), ...corps, id: documentId }
    const document = this.dependances.constructeur.construireEntiteDocumentDepuisCorps(fusion, documentId)
    await this.dependances.daoDocument.sauvegarder(document)

    const dto = this.dependances.mappeur.mapperDocumentEnDto(document)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'documents',
      operation: 'UPDATE',
      actorId: contexte.utilisateurId,
      resourceId: documentId,
      path: `/documents/${documentId}`,
      executerRollback: async () => {
        await this.dependances.daoDocument.sauvegarder(avantEntite)
      },
    })

    return { donnees: dto, annulation }
  }

  public async supprimerDocument(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    documentId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'documents')
    const document = await this.dependances.daoDocument.rechercherParId(documentId)
    this.exigerEntite(document, t(ERRORS.ADMIN_DOCUMENT_INTROUVABLE))

    const avantEntite = document
    await this.dependances.daoDocument.supprimerParId(documentId)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'documents',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: documentId,
      path: `/documents/${documentId}`,
      executerRollback: async () => {
        await this.dependances.daoDocument.sauvegarder(avantEntite)
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
