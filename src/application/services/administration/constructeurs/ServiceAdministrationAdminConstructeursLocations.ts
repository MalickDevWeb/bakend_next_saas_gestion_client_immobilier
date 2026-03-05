import { randomUUID } from 'node:crypto'
import {
  BuilderEntiteCaution,
  BuilderEntiteClient,
  BuilderEntiteDocument,
  BuilderEntiteLocation,
  BuilderEntitePaiementCaution,
  BuilderEntitePaiementMensuel,
  BuilderEntiteTransactionPaiement,
} from '@/src/domaine/builders'
import {
  EntiteClient,
  EntiteDocument,
  EntiteLocation,
  EntitePaiementCaution,
  EntitePaiementMensuel,
  EntiteTransactionPaiement,
} from '@/src/domaine/entites'
import { ServiceAdministrationAdminUtilitaires } from '@/src/application/services/administration/commun/ServiceAdministrationAdminUtilitaires'
export class ServiceAdministrationAdminConstructeursLocations {
  public construireEntiteClientDepuisCorps(
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
      .avecDateCreation(ServiceAdministrationAdminUtilitaires.versDate(corps.createdAt))
      .avecLocations(locations)
    const email = ServiceAdministrationAdminUtilitaires.versTexteOptionnel(corps.email)
    if (email) {
      builder.avecEmail(email)
    }
    return builder.construire()
  }
  public construireEntiteLocationDepuisCorps(
    corps: Record<string, unknown>,
    clientId: string
  ): EntiteLocation {
    const documents = Array.isArray(corps.documents)
      ? corps.documents.map((document) =>
          this.construireEntiteDocumentDepuisCorps(
            ServiceAdministrationAdminUtilitaires.versObjet(document)
          )
        )
      : []
    const paiements = Array.isArray(corps.payments)
      ? corps.payments.map((paiement) =>
          this.construireEntitePaiementMensuelDepuisCorps(
            ServiceAdministrationAdminUtilitaires.versObjet(paiement),
            String(corps.id || randomUUID())
          )
        )
      : []
    const cautionBrute = ServiceAdministrationAdminUtilitaires.versObjet(corps.deposit)
    const paiementsCaution = Array.isArray(cautionBrute.payments)
      ? cautionBrute.payments.map((paiement) =>
          this.construireEntiteDepotDepuisCorps(
            ServiceAdministrationAdminUtilitaires.versObjet(paiement)
          )
        )
      : []
    return new BuilderEntiteLocation()
      .avecId(String(corps.id || randomUUID()))
      .avecClientId(clientId)
      .avecTypeBien(this.normaliserTypeBien(corps.propertyType))
      .avecNomBien(String(corps.propertyName || 'Bien inconnu'))
      .avecLoyerMensuel(ServiceAdministrationAdminUtilitaires.versNombre(corps.monthlyRent))
      .avecDateDebut(ServiceAdministrationAdminUtilitaires.versDate(corps.startDate))
      .avecCaution(
        new BuilderEntiteCaution()
          .avecMontantTotal(ServiceAdministrationAdminUtilitaires.versNombre(cautionBrute.total))
          .avecMontantPaye(ServiceAdministrationAdminUtilitaires.versNombre(cautionBrute.paid))
          .avecPaiements(paiementsCaution)
          .construire()
      )
      .avecPaiementsMensuels(paiements)
      .avecDocuments(documents)
      .construire()
  }
  public construireEntiteDocumentDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteDocument {
    return new BuilderEntiteDocument()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecNom(String(corps.name || corps.nom || 'Document'))
      .avecType(this.normaliserTypeDocument(corps.type))
      .avecUrl(String(corps.url || 'https://example.com/document'))
      .avecDateAjout(
        ServiceAdministrationAdminUtilitaires.versDate(corps.uploadedAt || corps.dateAjout)
      )
      .avecEstSigne(Boolean(corps.signed ?? corps.estSigne))
      .construire()
  }
  public construireEntitePaiementDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntiteTransactionPaiement {
    return new BuilderEntiteTransactionPaiement()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecMontant(ServiceAdministrationAdminUtilitaires.versNombre(corps.amount || corps.montant))
      .avecDatePaiement(
        ServiceAdministrationAdminUtilitaires.versDate(corps.date || corps.datePaiement)
      )
      .avecNumeroRecu(
        String(corps.receiptNumber || corps.numeroRecu || corps.receiptId || `REC-${Date.now()}`)
      )
      .avecDescription(
        ServiceAdministrationAdminUtilitaires.versTexteOptionnel(
          corps.description || corps.notes
        ) || ''
      )
      .construire()
  }
  public construireEntiteDepotDepuisCorps(
    corps: Record<string, unknown>,
    idForce?: string
  ): EntitePaiementCaution {
    return new BuilderEntitePaiementCaution()
      .avecId(String(idForce || corps.id || randomUUID()))
      .avecMontant(ServiceAdministrationAdminUtilitaires.versNombre(corps.amount || corps.montant))
      .avecDatePaiement(
        ServiceAdministrationAdminUtilitaires.versDate(corps.date || corps.datePaiement)
      )
      .avecNumeroRecu(
        String(corps.receiptNumber || corps.numeroRecu || corps.receiptId || `DEP-${Date.now()}`)
      )
      .avecNote(
        ServiceAdministrationAdminUtilitaires.versTexteOptionnel(
          corps.description || corps.notes
        ) || ''
      )
      .construire()
  }
  private extraireLocationsDepuisCorps(
    corps: Record<string, unknown>,
    clientIdForce?: string
  ): EntiteClient['locations'] {
    const idClient = String(clientIdForce || corps.id || '')
    const locationsBrutes = Array.isArray(corps.rentals) ? corps.rentals : []
    return locationsBrutes.map((location) =>
      this.construireEntiteLocationDepuisCorps(
        ServiceAdministrationAdminUtilitaires.versObjet(location),
        idClient
      )
    )
  }
  private construireEntitePaiementMensuelDepuisCorps(
    corps: Record<string, unknown>,
    locationId: string
  ): EntitePaiementMensuel {
    const transactions = Array.isArray(corps.payments)
      ? corps.payments.map((transaction) =>
          this.construireEntitePaiementDepuisCorps({
            ...ServiceAdministrationAdminUtilitaires.versObjet(transaction),
            id:
              ServiceAdministrationAdminUtilitaires.versObjet(transaction).id ||
              randomUUID(),
          })
        )
      : []
    return new BuilderEntitePaiementMensuel()
      .avecId(String(corps.id || randomUUID()))
      .avecLocationId(locationId)
      .avecPeriodeDebut(ServiceAdministrationAdminUtilitaires.versDate(corps.periodStart))
      .avecPeriodeFin(ServiceAdministrationAdminUtilitaires.versDate(corps.periodEnd))
      .avecDateEcheance(ServiceAdministrationAdminUtilitaires.versDate(corps.dueDate))
      .avecMontantDu(ServiceAdministrationAdminUtilitaires.versNombre(corps.amount))
      .avecMontantPaye(ServiceAdministrationAdminUtilitaires.versNombre(corps.paidAmount))
      .avecStatut(this.normaliserStatutPaiementMensuel(corps.status))
      .avecTransactions(transactions)
      .construire()
  }
  private normaliserTypeBien(
    valeur: unknown
  ): 'studio' | 'room' | 'apartment' | 'villa' | 'other' {
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
  private normaliserStatutPaiementMensuel(
    valeur: unknown
  ): 'paid' | 'partial' | 'unpaid' | 'late' {
    const statut = String(valeur || 'unpaid').toLowerCase()
    if (statut === 'paid' || statut === 'partial' || statut === 'unpaid' || statut === 'late') {
      return statut
    }
    return 'unpaid'
  }
}
