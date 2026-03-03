import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteJournalAudit } from '@/src/domaine/entites/EntiteJournalAudit'
import { ObjetValeurAdresseIp } from '@/src/domaine/objets_valeur'

export class BuilderEntiteJournalAudit extends BuilderAbstrait<EntiteJournalAudit> {
  private id?: string
  private acteur?: string
  private action?: string
  private typeCible?: string
  private idCible?: string
  private message?: string
  private adresseIp?: string
  private creeLe?: Date

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecActeur(valeur: string): this { this.acteur = valeur; return this }
  public avecAction(valeur: string): this { this.action = valeur; return this }
  public avecTypeCible(valeur: string): this { this.typeCible = valeur; return this }
  public avecIdCible(valeur: string): this { this.idCible = valeur; return this }
  public avecMessage(valeur: string): this { this.message = valeur; return this }
  public avecAdresseIp(valeur: string): this { this.adresseIp = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }

  public construire(): EntiteJournalAudit {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const adresseIp = this.adresseIp ? new ObjetValeurAdresseIp(this.adresseIp).valeur : undefined
    return new EntiteJournalAudit(
      id,
      this.acteur,
      this.action,
      this.typeCible,
      this.idCible,
      this.message,
      adresseIp,
      this.dateOuMaintenant(this.creeLe)
    )
  }
}
