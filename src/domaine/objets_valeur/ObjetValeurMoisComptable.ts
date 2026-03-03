export class ObjetValeurMoisComptable {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').trim()
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(normalise)) {
      throw new Error('Mois comptable invalide (attendu: YYYY-MM)')
    }
    this.valeur = normalise
  }
}
