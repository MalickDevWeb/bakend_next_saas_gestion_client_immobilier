import { ExceptionObjetValeurInvalide } from '@/src/domaine/exceptions'

export class ObjetValeurAgentUtilisateur {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').trim()
    if (!normalise) {
      throw new ExceptionObjetValeurInvalide('Agent utilisateur invalide: vide')
    }
    if (normalise.length > 1024) {
      throw new ExceptionObjetValeurInvalide('Agent utilisateur invalide: trop long')
    }
    this.valeur = normalise
  }
}
