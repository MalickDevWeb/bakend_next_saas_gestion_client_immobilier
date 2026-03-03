import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { ObjetValeurIdentifiant, ObjetValeurTexteNonVide } from '@/src/domaine/objets_valeur'
import { TypePrioriteTravail } from '@/src/domaine/types/systeme/TypePrioriteTravail'
import { TypeStatutTravail } from '@/src/domaine/types/systeme/TypeStatutTravail'

export class EntiteItemTravail extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public titre: string,
    public description: string,
    public priorite: TypePrioriteTravail = 'medium',
    public statut: TypeStatutTravail = 'pending',
    public readonly creeLe: Date = new Date(),
    public dateEcheance?: Date,
    public detecteAutomatiquement = false
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    this.titre = new ObjetValeurTexteNonVide(titre, 'titre', 200).valeur
    this.description = new ObjetValeurTexteNonVide(description, 'description', 2000).valeur
  }

  public marquerCommeComplete(): void {
    this.statut = 'completed'
  }

  public basculerStatut(): void {
    this.statut = this.statut === 'completed' ? 'pending' : 'completed'
  }
}
