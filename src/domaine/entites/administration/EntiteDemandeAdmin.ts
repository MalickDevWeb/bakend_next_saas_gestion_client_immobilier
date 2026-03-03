import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import {
  ObjetValeurEmail,
  ObjetValeurIdentifiant,
  ObjetValeurTelephoneSenegal,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'
import { TypeStatutAdmin } from '@/src/domaine/types/administration/TypeStatutAdmin'

export class EntiteDemandeAdmin extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public nom: string,
    public email?: string,
    public telephone?: string,
    public nomEntreprise?: string,
    public statut: TypeStatutAdmin = 'EN_ATTENTE',
    public nomUtilisateur?: string,
    public motDePasse?: string,
    public paye = false,
    public payeLe?: Date,
    public readonly creeLe: Date = new Date()
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    this.nom = new ObjetValeurTexteNonVide(nom, 'nom', 160).valeur
    if (email) this.email = new ObjetValeurEmail(email).valeur
    if (telephone) this.telephone = new ObjetValeurTelephoneSenegal(telephone).valeur
    if (nomEntreprise) this.nomEntreprise = new ObjetValeurTexteNonVide(nomEntreprise, 'nomEntreprise', 180).valeur
    if (nomUtilisateur) {
      this.nomUtilisateur = new ObjetValeurTexteNonVide(nomUtilisateur, 'nomUtilisateur', 120).valeur
    }
  }

  public marquerCommePayee(datePaiement: Date = new Date()): void {
    this.paye = true
    this.payeLe = datePaiement
  }
}
