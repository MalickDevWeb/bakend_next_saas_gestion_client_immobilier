import { EntiteContract } from '@/src/domaine/entites/contrats/EntiteContract'

export class BuilderEntiteContract {
  private id = ''
  private adminId = ''
  private clientId = ''
  private locationId: string | null = null
  private templateId: string | null = null
  private statut: 'pending_signature' | 'signed' | 'draft' = 'pending_signature'
  private pdfUrl: string | null = null
  private payload: Record<string, unknown> | null = null
  private hashContenu: string | null = null
  private signeLe: Date | null = null
  private creeLe = new Date()
  private misAJourLe = new Date()

  public avecId(id: string) {
    this.id = id
    return this
  }
  public avecAdminId(adminId: string) {
    this.adminId = adminId
    return this
  }
  public avecClientId(clientId: string) {
    this.clientId = clientId
    return this
  }
  public avecLocationId(locationId: string | null) {
    this.locationId = locationId
    return this
  }
  public avecTemplateId(templateId: string | null) {
    this.templateId = templateId
    return this
  }
  public avecStatut(statut: 'pending_signature' | 'signed' | 'draft') {
    this.statut = statut
    return this
  }
  public avecPdfUrl(pdfUrl: string | null) {
    this.pdfUrl = pdfUrl
    return this
  }
  public avecPayload(payload: Record<string, unknown> | null) {
    this.payload = payload
    return this
  }
  public avecHashContenu(hash: string | null) {
    this.hashContenu = hash
    return this
  }
  public avecSigneLe(date: Date | null) {
    this.signeLe = date
    return this
  }
  public avecCreeLe(date: Date) {
    this.creeLe = date
    return this
  }
  public avecMisAJourLe(date: Date) {
    this.misAJourLe = date
    return this
  }

  public build(): EntiteContract {
    return new EntiteContract(
      this.id,
      this.adminId,
      this.clientId,
      this.locationId,
      this.templateId,
      this.statut,
      this.pdfUrl,
      this.payload,
      this.hashContenu,
      this.signeLe,
      this.creeLe,
      this.misAJourLe
    )
  }
}
