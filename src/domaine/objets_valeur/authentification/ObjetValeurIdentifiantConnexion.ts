import { ExceptionObjetValeurInvalide } from '@/src/domaine/exceptions'

export class ObjetValeurIdentifiantConnexion {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').trim()
    if (!normalise) {
      throw new ExceptionObjetValeurInvalide('Identifiant connexion invalide: vide')
    }
    if (normalise.length < 3 || normalise.length > 190) {
      throw new ExceptionObjetValeurInvalide('Identifiant connexion invalide: longueur non autorisee')
    }
    this.valeur = normalise
  }
}
