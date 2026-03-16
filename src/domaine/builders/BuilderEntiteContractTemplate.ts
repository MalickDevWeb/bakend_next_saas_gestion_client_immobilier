import { EntiteContractTemplate } from '@/src/domaine/entites/contrats/EntiteContractTemplate'

export class BuilderEntiteContractTemplate {
  private id = ''
  private adminId = ''
  private nom = ''
  private corps = ''
  private placeholders: Record<string, unknown> | null = null
  private version = 1
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

  public avecNom(nom: string) {
    this.nom = nom
    return this
  }

  public avecCorps(corps: string) {
    this.corps = corps
    return this
  }

  public avecPlaceholders(placeholders: Record<string, unknown> | null) {
    this.placeholders = placeholders
    return this
  }

  public avecVersion(version: number) {
    this.version = version
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

  public build(): EntiteContractTemplate {
    return new EntiteContractTemplate(
      this.id,
      this.adminId,
      this.nom,
      this.corps,
      this.placeholders,
      this.version,
      this.creeLe,
      this.misAJourLe
    )
  }
}
