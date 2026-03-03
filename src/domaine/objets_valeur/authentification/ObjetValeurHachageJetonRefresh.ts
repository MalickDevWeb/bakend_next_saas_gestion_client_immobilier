import { ExceptionObjetValeurInvalide } from '@/src/domaine/exceptions'

export class ObjetValeurHachageJetonRefresh {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').trim().toLowerCase()
    const motifSha256Hex = /^[a-f0-9]{64}$/
    if (!motifSha256Hex.test(normalise)) {
      throw new ExceptionObjetValeurInvalide('Hachage jeton refresh invalide: format attendu sha256 hex')
    }
    this.valeur = normalise
  }
}
