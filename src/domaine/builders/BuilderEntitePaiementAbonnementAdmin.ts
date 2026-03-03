import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntitePaiementAbonnementAdmin } from '@/src/domaine/entites/EntitePaiementAbonnementAdmin'
import {
  ObjetValeurMoisComptable,
  ObjetValeurTelephoneSenegal,
  ObjetValeurUrlHttpOuChemin,
} from '@/src/domaine/objets_valeur'
import { TypeMethodePaiementAbonnement } from '@/src/domaine/types/TypeMethodePaiementAbonnement'
import { TypeModeAbonnementAdmin } from '@/src/domaine/types/TypeModeAbonnementAdmin'
import { TypeStatutPaiementAbonnement } from '@/src/domaine/types/TypeStatutPaiementAbonnement'

export class BuilderEntitePaiementAbonnementAdmin extends BuilderAbstrait<EntitePaiementAbonnementAdmin> {
  private id?: string
  private adminId?: string
  private montant = 0
  private methode: TypeMethodePaiementAbonnement = 'wave'
  private mois?: string
  private entrepriseId?: string
  private statut: TypeStatutPaiementAbonnement = 'pending'
  private fournisseur?: 'stripe' | 'wave' | 'orange' | 'manual'
  private referenceFournisseur?: string
  private urlPaiement?: string
  private telephonePayeur?: string
  private referenceTransaction?: string
  private note?: string
  private payeLe?: Date | null
  private approuveLe?: Date | null
  private approuvePar?: string | null
  private modeAbonnement: TypeModeAbonnementAdmin = 'monthly'
  private creeLe?: Date

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecAdminId(valeur: string): this { this.adminId = valeur; return this }
  public avecMontant(valeur: number): this { this.montant = valeur; return this }
  public avecMethode(valeur: TypeMethodePaiementAbonnement): this { this.methode = valeur; return this }
  public avecMois(valeur: string): this { this.mois = valeur; return this }
  public avecEntrepriseId(valeur: string): this { this.entrepriseId = valeur; return this }
  public avecStatut(valeur: TypeStatutPaiementAbonnement): this { this.statut = valeur; return this }
  public avecFournisseur(valeur: 'stripe' | 'wave' | 'orange' | 'manual'): this { this.fournisseur = valeur; return this }
  public avecReferenceFournisseur(valeur: string): this { this.referenceFournisseur = valeur; return this }
  public avecUrlPaiement(valeur: string): this { this.urlPaiement = valeur; return this }
  public avecTelephonePayeur(valeur: string): this { this.telephonePayeur = valeur; return this }
  public avecReferenceTransaction(valeur: string): this { this.referenceTransaction = valeur; return this }
  public avecNote(valeur: string): this { this.note = valeur; return this }
  public avecPayeLe(valeur: Date | null): this { this.payeLe = valeur; return this }
  public avecApprouveLe(valeur: Date | null): this { this.approuveLe = valeur; return this }
  public avecApprouvePar(valeur: string | null): this { this.approuvePar = valeur; return this }
  public avecModeAbonnement(valeur: TypeModeAbonnementAdmin): this { this.modeAbonnement = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }

  public construire(): EntitePaiementAbonnementAdmin {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const adminId = this.exigerIdentifiant(this.adminId, 'adminId')
    const mois = new ObjetValeurMoisComptable(this.exiger(this.mois, 'mois')).valeur
    const entrepriseId = this.entrepriseId ? this.exigerIdentifiant(this.entrepriseId, 'entrepriseId') : undefined
    const telephonePayeur = this.telephonePayeur
      ? new ObjetValeurTelephoneSenegal(this.telephonePayeur).valeur
      : undefined
    const urlPaiement = this.urlPaiement ? new ObjetValeurUrlHttpOuChemin(this.urlPaiement).valeur : undefined

    return new EntitePaiementAbonnementAdmin(
      id,
      adminId,
      this.montantStrictementPositif(this.montant, 'montant'),
      this.methode,
      mois,
      entrepriseId,
      this.statut,
      this.fournisseur,
      this.referenceFournisseur,
      urlPaiement,
      telephonePayeur,
      this.referenceTransaction,
      this.note,
      this.payeLe,
      this.approuveLe,
      this.approuvePar,
      this.modeAbonnement,
      this.dateOuMaintenant(this.creeLe)
    )
  }
}
