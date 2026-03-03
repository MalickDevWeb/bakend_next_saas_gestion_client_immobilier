import {
  ObjetValeurIdentifiant,
  ObjetValeurMontant,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'

export abstract class BuilderAbstrait<T> {
  protected exigerIdentifiant(valeur: string | undefined, champ: string): string {
    return new ObjetValeurIdentifiant(this.exiger(valeur, champ)).valeur
  }

  protected exigerTexte(valeur: string | undefined, champ: string, longueurMax = 255): string {
    return new ObjetValeurTexteNonVide(this.exiger(valeur, champ), champ, longueurMax).valeur
  }

  protected exiger(valeur: string | undefined, champ: string): string {
    const normalise = String(valeur || '').trim()
    if (!normalise) {
      throw new Error(`${champ} est obligatoire`)
    }
    return normalise
  }

  protected dateOuMaintenant(valeur?: Date): Date {
    if (!valeur) return new Date()
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('Date invalide')
    }
    return valeur
  }

  protected montantNonNegatif(valeur: number, champ: string): number {
    try {
      return new ObjetValeurMontant(valeur).valeur
    } catch {
      throw new Error(`${champ} invalide`)
    }
  }

  protected montantStrictementPositif(valeur: number, champ: string): number {
    const montant = this.montantNonNegatif(valeur, champ)
    if (montant <= 0) {
      throw new Error(`${champ} doit etre strictement positif`)
    }
    return montant
  }

  public abstract construire(): T
}
