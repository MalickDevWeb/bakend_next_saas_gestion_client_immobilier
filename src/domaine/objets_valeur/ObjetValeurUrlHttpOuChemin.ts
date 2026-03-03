export class ObjetValeurUrlHttpOuChemin {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').trim()
    const valide = normalise.startsWith('/') || /^https?:\/\//i.test(normalise)
    if (!valide) {
      throw new Error('URL invalide (http(s) ou chemin /...)')
    }
    this.valeur = normalise
  }
}
