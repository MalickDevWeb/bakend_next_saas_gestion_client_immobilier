import { ExceptionObjetValeurInvalide } from '@/src/domaine/exceptions'

export class ObjetValeurJetonAccesJti {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').trim()
    if (!normalise) {
      throw new ExceptionObjetValeurInvalide('Jeton acces JTI invalide: vide')
    }
    if (normalise.length < 8 || normalise.length > 200) {
      throw new ExceptionObjetValeurInvalide('Jeton acces JTI invalide: longueur non autorisee')
    }
    this.valeur = normalise
  }
}
