export class ObjetValeurIdentifiant {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').trim()
    if (!normalise) {
      throw new Error('Identifiant invalide')
    }
    this.valeur = normalise
  }
}
