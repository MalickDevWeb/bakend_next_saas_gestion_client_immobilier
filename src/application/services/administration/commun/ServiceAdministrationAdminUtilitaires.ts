import { TypeOrdreTriAdministrationAdmin } from '@/src/domaine/types/administration'

export class ServiceAdministrationAdminUtilitaires {
  public static trierElements<T extends Record<string, unknown>>(
    elements: T[],
    champTri?: string | null,
    ordreTri?: string | null
  ): T[] {
    const champ = String(champTri || '').trim()
    if (!champ) {
      return elements
    }

    const ordre: TypeOrdreTriAdministrationAdmin =
      String(ordreTri || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc'

    return [...elements].sort((a, b) => {
      const valeurA = this.valeurComparable(a[champ])
      const valeurB = this.valeurComparable(b[champ])
      if (valeurA < valeurB) return ordre === 'asc' ? -1 : 1
      if (valeurA > valeurB) return ordre === 'asc' ? 1 : -1
      return 0
    })
  }

  public static versDate(valeur: unknown): Date {
    if (valeur instanceof Date && !Number.isNaN(valeur.getTime())) {
      return valeur
    }

    const date = new Date(String(valeur || ''))
    if (!Number.isNaN(date.getTime())) {
      return date
    }

    return new Date()
  }

  public static versDateOptionnelle(valeur: unknown): Date | null {
    if (valeur === null || valeur === undefined || valeur === '') {
      return null
    }

    const date = this.versDate(valeur)
    if (Number.isNaN(date.getTime())) {
      return null
    }

    return date
  }

  public static versNombre(valeur: unknown): number {
    const nombre = Number(valeur)
    if (!Number.isFinite(nombre)) {
      return 0
    }

    return nombre
  }

  public static versNombreEntier(valeur: unknown, valeurParDefaut = 0): number {
    const nombre = Number(valeur)
    if (!Number.isFinite(nombre)) {
      return valeurParDefaut
    }

    return Math.floor(nombre)
  }

  public static versTexteOptionnel(valeur: unknown): string | undefined {
    const texte = String(valeur || '').trim()
    return texte || undefined
  }

  public static versObjet(valeur: unknown): Record<string, unknown> {
    if (valeur && typeof valeur === 'object' && !Array.isArray(valeur)) {
      return valeur as Record<string, unknown>
    }

    return {}
  }

  public static moisCourant(): string {
    const date = new Date()
    const mois = String(date.getUTCMonth() + 1).padStart(2, '0')
    return `${date.getUTCFullYear()}-${mois}`
  }

  private static valeurComparable(valeur: unknown): string | number {
    if (valeur instanceof Date) {
      return valeur.getTime()
    }

    if (typeof valeur === 'number') {
      return valeur
    }

    const texte = String(valeur || '')
    const date = Date.parse(texte)
    if (!Number.isNaN(date) && texte.includes('-')) {
      return date
    }

    return texte.toLowerCase()
  }
}
