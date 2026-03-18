import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteDocument } from '@/src/domaine/entites/locations/EntiteDocument'
import { ObjetValeurUrlHttpOuChemin } from '@/src/domaine/objets_valeur'
import { TypeDocument } from '@/src/domaine/types/locations/TypeDocument'

export class BuilderEntiteDocument extends BuilderAbstrait<EntiteDocument> {
  private id?: string
  private nom?: string
  private type: TypeDocument = 'other'
  private url?: string
  private dateAjout?: Date
  private estSigne = false
  private templateId: string | null = null
  private templateName: string | null = null
  private statut: 'draft' | 'pending_signature' | 'signed' | null = null
  private items: Record<string, unknown>[] | null = null

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecNom(valeur: string): this { this.nom = valeur; return this }
  public avecType(valeur: TypeDocument): this { this.type = valeur; return this }
  public avecUrl(valeur: string): this { this.url = valeur; return this }
  public avecDateAjout(valeur: Date): this { this.dateAjout = valeur; return this }
  public avecEstSigne(valeur: boolean): this { this.estSigne = valeur; return this }
  public avecTemplateId(valeur: string | null): this { this.templateId = valeur; return this }
  public avecTemplateName(valeur: string | null): this { this.templateName = valeur; return this }
  public avecStatut(valeur: 'draft' | 'pending_signature' | 'signed' | null): this { this.statut = valeur; return this }
  public avecItems(valeur: Record<string, unknown>[] | null): this { this.items = valeur; return this }

  public construire(): EntiteDocument {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const nom = this.exigerTexte(this.nom, 'nom')
    const url = new ObjetValeurUrlHttpOuChemin(this.exiger(this.url, 'url')).valeur
    return new EntiteDocument(
      id,
      nom,
      this.type,
      url,
      this.dateOuMaintenant(this.dateAjout),
      this.estSigne,
      this.templateId,
      this.templateName,
      this.statut,
      this.items
    )
  }
}
