export class ObjetValeurTexteNonVide {
  public readonly valeur: string

  constructor(valeur: string, libelle = 'texte', longueurMax = 255) {
    const normalise = String(valeur || '').trim()
    if (!normalise) {
      throw new Error(`${libelle} invalide`)
    }
    if (normalise.length > longueurMax) {
      throw new Error(`${libelle} trop long`)
    }
    this.valeur = normalise
  }
}
