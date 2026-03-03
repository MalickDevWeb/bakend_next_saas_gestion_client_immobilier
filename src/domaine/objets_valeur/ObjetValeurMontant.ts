export class ObjetValeurMontant {
  public readonly valeur: number

  constructor(valeur: number) {
    if (!Number.isFinite(valeur) || valeur < 0) {
      throw new Error('Montant invalide')
    }
    this.valeur = Number(valeur)
  }

  public estStrictementPositif(): boolean {
    return this.valeur > 0
  }
}
