export class ObjetValeurTelephoneSenegal {
  public readonly valeur: string

  constructor(valeur: string) {
    const brut = String(valeur || '').trim()
    const compact = brut.replace(/[\s-]+/g, '')

    let normalise = compact
    if (normalise.startsWith('+')) {
      normalise = `+${normalise.slice(1).replace(/\D/g, '')}`
    } else {
      normalise = normalise.replace(/\D/g, '')
    }

    const formatValide = /^(\+2217\d{8}|7\d{8})$/.test(normalise)
    if (!formatValide) {
      throw new Error('Telephone senegalais invalide')
    }

    this.valeur = normalise
  }
}
