export class ObjetValeurCniSenegal {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').replace(/\D/g, '')
    if (!/^\d{13}$/.test(normalise)) {
      throw new Error('CNI invalide')
    }
    this.valeur = normalise
  }
}
