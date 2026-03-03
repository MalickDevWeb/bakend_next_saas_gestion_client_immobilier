import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteIpBloquee } from '@/src/domaine/entites/systeme/EntiteIpBloquee'
import { ObjetValeurAdresseIp } from '@/src/domaine/objets_valeur'

export class BuilderEntiteIpBloquee extends BuilderAbstrait<EntiteIpBloquee> {
  private id?: string
  private adresseIp?: string
  private raison?: string
  private creeLe?: Date

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecAdresseIp(valeur: string): this { this.adresseIp = valeur; return this }
  public avecRaison(valeur: string): this { this.raison = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }

  public construire(): EntiteIpBloquee {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const adresseIp = new ObjetValeurAdresseIp(this.exiger(this.adresseIp, 'adresseIp')).valeur
    return new EntiteIpBloquee(id, adresseIp, this.raison, this.dateOuMaintenant(this.creeLe))
  }
}
