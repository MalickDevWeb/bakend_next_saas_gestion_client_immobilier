import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import {
  ObjetValeurIdentifiant,
  ObjetValeurMoisComptable,
  ObjetValeurMontant,
  ObjetValeurTelephoneSenegal,
  ObjetValeurTexteNonVide,
  ObjetValeurUrlHttpOuChemin,
} from '@/src/domaine/objets_valeur'
import { TypeMethodePaiementAbonnement } from '@/src/domaine/types/administration/TypeMethodePaiementAbonnement'
import { TypeModeAbonnementAdmin } from '@/src/domaine/types/administration/TypeModeAbonnementAdmin'
import { TypeStatutPaiementAbonnement } from '@/src/domaine/types/administration/TypeStatutPaiementAbonnement'

export class EntitePaiementAbonnementAdmin extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public readonly adminId: string,
    public montant: number,
    public methode: TypeMethodePaiementAbonnement,
    public mois: string,
    public entrepriseId?: string,
    public statut: TypeStatutPaiementAbonnement = 'pending',
    public fournisseur?: 'stripe' | 'wave' | 'orange' | 'manual',
    public referenceFournisseur?: string,
    public urlPaiement?: string,
    public telephonePayeur?: string,
    public referenceTransaction?: string,
    public note?: string,
    public payeLe?: Date | null,
    public approuveLe?: Date | null,
    public approuvePar?: string | null,
    public modeAbonnement: TypeModeAbonnementAdmin = 'monthly',
    public readonly creeLe: Date = new Date()
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    new ObjetValeurIdentifiant(adminId)
    if (entrepriseId) new ObjetValeurIdentifiant(entrepriseId)
    this.montant = new ObjetValeurMontant(montant).valeur
    this.mois = new ObjetValeurMoisComptable(mois).valeur
    if (referenceFournisseur) {
      this.referenceFournisseur = new ObjetValeurTexteNonVide(referenceFournisseur, 'referenceFournisseur', 180).valeur
    }
    if (urlPaiement) {
      this.urlPaiement = new ObjetValeurUrlHttpOuChemin(urlPaiement).valeur
    }
    if (telephonePayeur) {
      this.telephonePayeur = new ObjetValeurTelephoneSenegal(telephonePayeur).valeur
    }
    if (referenceTransaction) {
      this.referenceTransaction = new ObjetValeurTexteNonVide(referenceTransaction, 'referenceTransaction', 180).valeur
    }
    if (note) {
      this.note = new ObjetValeurTexteNonVide(note, 'note', 2000).valeur
    }
    if (approuvePar) {
      this.approuvePar = new ObjetValeurIdentifiant(approuvePar).valeur
    }
  }

  public marquerCommePaye(datePaiement: Date = new Date()): void {
    this.statut = 'paid'
    this.payeLe = datePaiement
  }
}
