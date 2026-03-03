import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntiteLocation } from '@/src/domaine/entites/locations/EntiteLocation'
import {
  ObjetValeurCniSenegal,
  ObjetValeurEmail,
  ObjetValeurIdentifiant,
  ObjetValeurTelephoneSenegal,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'
import { TypeStatutClient } from '@/src/domaine/types/locations/TypeStatutClient'

export class EntiteClient extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public prenom: string,
    public nom: string,
    public telephone: string,
    public cni: string,
    public adminId?: string,
    public email?: string,
    public statut: TypeStatutClient = 'active',
    public readonly creeLe: Date = new Date(),
    public locations: EntiteLocation[] = []
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    this.prenom = new ObjetValeurTexteNonVide(prenom, 'prenom', 120).valeur
    this.nom = new ObjetValeurTexteNonVide(nom, 'nom', 120).valeur
    this.telephone = new ObjetValeurTelephoneSenegal(telephone).valeur
    this.cni = new ObjetValeurCniSenegal(cni).valeur
    if (adminId) new ObjetValeurIdentifiant(adminId)
    if (email) this.email = new ObjetValeurEmail(email).valeur
  }

  public nomComplet(): string {
    return `${this.prenom} ${this.nom}`.trim()
  }

  public ajouterLocation(location: EntiteLocation): void {
    this.locations.push(location)
  }

  public aDesLocations(): boolean {
    return this.locations.length > 0
  }
}
