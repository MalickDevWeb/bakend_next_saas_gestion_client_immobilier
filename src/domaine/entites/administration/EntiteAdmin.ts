import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntitePermissionsAdmin } from '@/src/domaine/entites/administration/EntitePermissionsAdmin'
import {
  ObjetValeurEmail,
  ObjetValeurIdentifiant,
  ObjetValeurMontant,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'
import { TypeModeAbonnementAdmin } from '@/src/domaine/types/administration/TypeModeAbonnementAdmin'
import { TypeStatutAdmin } from '@/src/domaine/types/administration/TypeStatutAdmin'

export class EntiteAdmin extends ObjetDomaine {
  private readonly _id: ObjetValeurIdentifiant
  private readonly _utilisateurId: ObjetValeurIdentifiant
  private _nomUtilisateur: ObjetValeurTexteNonVide
  private _nom: ObjetValeurTexteNonVide
  private _email: ObjetValeurEmail
  private _entrepriseId?: ObjetValeurIdentifiant
  private _montantMensuelAbonnement: ObjetValeurMontant
  private _montantAnnuelAbonnement: ObjetValeurMontant

  constructor(
    id: string,
    utilisateurId: string,
    nomUtilisateur: string,
    nom: string,
    email: string,
    public statut: TypeStatutAdmin = 'EN_ATTENTE',
    entrepriseId?: string,
    public modeAbonnement: TypeModeAbonnementAdmin = 'monthly',
    montantMensuelAbonnement = 0,
    montantAnnuelAbonnement = 0,
    public autoriserMontantPersonnalise = false,
    public notifierClientsRetard = false,
    public notifierAdminRetard = false,
    public permissions: EntitePermissionsAdmin = new EntitePermissionsAdmin(),
    public readonly creeLe: Date = new Date()
  ) {
    super()
    this._id = new ObjetValeurIdentifiant(id)
    this._utilisateurId = new ObjetValeurIdentifiant(utilisateurId)
    this._nomUtilisateur = new ObjetValeurTexteNonVide(nomUtilisateur, 'nomUtilisateur', 150)
    this._nom = new ObjetValeurTexteNonVide(nom, 'nom', 200)
    this._email = new ObjetValeurEmail(email)
    this._entrepriseId = entrepriseId ? new ObjetValeurIdentifiant(entrepriseId) : undefined
    this._montantMensuelAbonnement = new ObjetValeurMontant(montantMensuelAbonnement)
    this._montantAnnuelAbonnement = new ObjetValeurMontant(montantAnnuelAbonnement)
  }

  public get id(): string {
    return this._id.valeur
  }

  public get utilisateurId(): string {
    return this._utilisateurId.valeur
  }

  public get nomUtilisateur(): string {
    return this._nomUtilisateur.valeur
  }

  public set nomUtilisateur(valeur: string) {
    this._nomUtilisateur = new ObjetValeurTexteNonVide(valeur, 'nomUtilisateur', 150)
  }

  public get nom(): string {
    return this._nom.valeur
  }

  public set nom(valeur: string) {
    this._nom = new ObjetValeurTexteNonVide(valeur, 'nom', 200)
  }

  public get email(): string {
    return this._email.valeur
  }

  public set email(valeur: string) {
    this._email = new ObjetValeurEmail(valeur)
  }

  public get entrepriseId(): string | undefined {
    return this._entrepriseId?.valeur
  }

  public set entrepriseId(valeur: string | undefined) {
    this._entrepriseId = valeur ? new ObjetValeurIdentifiant(valeur) : undefined
  }

  public get montantMensuelAbonnement(): number {
    return this._montantMensuelAbonnement.valeur
  }

  public set montantMensuelAbonnement(valeur: number) {
    this._montantMensuelAbonnement = new ObjetValeurMontant(valeur)
  }

  public get montantAnnuelAbonnement(): number {
    return this._montantAnnuelAbonnement.valeur
  }

  public set montantAnnuelAbonnement(valeur: number) {
    this._montantAnnuelAbonnement = new ObjetValeurMontant(valeur)
  }

  public get idObjetValeur(): ObjetValeurIdentifiant {
    return this._id
  }

  public get utilisateurIdObjetValeur(): ObjetValeurIdentifiant {
    return this._utilisateurId
  }

  public get emailObjetValeur(): ObjetValeurEmail {
    return this._email
  }

  public estActif(): boolean {
    return this.statut === 'ACTIF'
  }

  public peutAcceder(fonctionnalite: keyof EntitePermissionsAdmin): boolean {
    return Boolean(this.permissions[fonctionnalite])
  }

  public override toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      utilisateurId: this.utilisateurId,
      nomUtilisateur: this.nomUtilisateur,
      nom: this.nom,
      email: this.email,
      statut: this.statut,
      entrepriseId: this.entrepriseId,
      modeAbonnement: this.modeAbonnement,
      montantMensuelAbonnement: this.montantMensuelAbonnement,
      montantAnnuelAbonnement: this.montantAnnuelAbonnement,
      autoriserMontantPersonnalise: this.autoriserMontantPersonnalise,
      notifyClientsOverdue: this.notifierClientsRetard,
      notifyAdminOverdue: this.notifierAdminRetard,
      permissions: this.permissions,
      creeLe: this.creeLe,
    }
  }
}
