export const VALIDATION = {
  VERBEUX_INVALIDE: 'validation.verbeux_invalide',
} as const

export const VALIDATION_FR: Record<string, string> = {
  [VALIDATION.VERBEUX_INVALIDE]: 'Le parametre verbeux est invalide',
}

export const VALIDATION_EN: Record<string, string> = {
  [VALIDATION.VERBEUX_INVALIDE]: 'Verbose parameter is invalid',
}
