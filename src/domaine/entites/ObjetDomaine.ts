export abstract class ObjetDomaine {
  private static readonly CLES_IDENTITE: readonly string[] = [
    'id',
    'adminId',
    'utilisateurId',
    'clientId',
    'locationId',
    'entrepriseId',
    'numeroLigne',
  ]

  public equals(autre: unknown): boolean {
    if (this === autre) return true
    if (!autre || typeof autre !== 'object') return false
    if ((autre as { constructor?: unknown }).constructor !== this.constructor) return false

    const identiteActuelle = this.obtenirIdentite()
    const identiteAutre = (autre as ObjetDomaine).obtenirIdentite?.()

    if (identiteActuelle !== undefined && identiteAutre !== undefined) {
      return identiteActuelle === identiteAutre
    }

    return this.serialisationStable(this) === this.serialisationStable(autre)
  }

  public estEgal(autre: unknown): boolean {
    return this.equals(autre)
  }

  public toString(): string {
    const identite = this.obtenirIdentite()
    const valeur = identite === undefined ? 'sans-identite' : String(identite)
    return `${this.constructor.name}(${valeur})`
  }

  public toJSON(): Record<string, unknown> {
    return { ...(this as Record<string, unknown>) }
  }

  protected obtenirIdentite(): string | number | undefined {
    for (const cle of ObjetDomaine.CLES_IDENTITE) {
      const valeur = (this as Record<string, unknown>)[cle]
      if (typeof valeur === 'string' || typeof valeur === 'number') {
        return valeur
      }
    }
    return undefined
  }

  private serialisationStable(valeur: unknown): string {
    try {
      return JSON.stringify(valeur, this.replacerDate) || ''
    } catch {
      return ''
    }
  }

  private replacerDate(_cle: string, valeur: unknown): unknown {
    if (valeur instanceof Date) {
      return valeur.toISOString()
    }
    return valeur
  }
}
