import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntitePaiementCaution } from '@/src/domaine/entites/locations/EntitePaiementCaution'
import { ObjetValeurNumeroRecu } from '@/src/domaine/objets_valeur'

export class BuilderEntitePaiementCaution extends BuilderAbstrait<EntitePaiementCaution> {
  private id?: string
  private montant = 0
  private datePaiement?: Date
  private numeroRecu?: string
  private note?: string

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecMontant(valeur: number): this { this.montant = valeur; return this }
  public avecDatePaiement(valeur: Date): this { this.datePaiement = valeur; return this }
  public avecNumeroRecu(valeur: string): this { this.numeroRecu = valeur; return this }
  public avecNote(valeur: string): this { this.note = valeur; return this }

  public construire(): EntitePaiementCaution {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const montant = this.montantStrictementPositif(this.montant, 'montant')
    const numeroRecu = new ObjetValeurNumeroRecu(this.exiger(this.numeroRecu, 'numeroRecu')).valeur
    return new EntitePaiementCaution(id, montant, this.dateOuMaintenant(this.datePaiement), numeroRecu, this.note)
  }
}
