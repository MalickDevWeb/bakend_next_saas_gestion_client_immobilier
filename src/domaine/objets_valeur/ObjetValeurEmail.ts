export class ObjetValeurEmail {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').trim().toLowerCase()
    const formatValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalise)

    if (!formatValide) {
      throw new Error('Email invalide')
    }

    this.valeur = normalise
  }
}
