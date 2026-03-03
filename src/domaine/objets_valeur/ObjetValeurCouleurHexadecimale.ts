export class ObjetValeurCouleurHexadecimale {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').trim()
    if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(normalise)) {
      throw new Error('Couleur hexadecimale invalide')
    }
    this.valeur = normalise
  }
}
