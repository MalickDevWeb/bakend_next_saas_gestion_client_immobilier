export class ObjetValeurNumeroRecu {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').trim().toUpperCase()
    if (!normalise) {
      throw new Error('Numero de recu invalide')
    }
    this.valeur = normalise
  }
}
