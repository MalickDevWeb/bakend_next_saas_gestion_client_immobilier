export const ERRORS = {
  PARAMETRES_INVALIDES: 'errors.parametres_invalides',
  ERREUR_INTERNE_SERVEUR: 'errors.erreur_interne_serveur',
} as const

export const ERRORS_FR: Record<string, string> = {
  [ERRORS.PARAMETRES_INVALIDES]: 'Parametres invalides',
  [ERRORS.ERREUR_INTERNE_SERVEUR]: 'Erreur interne serveur',
}

export const ERRORS_EN: Record<string, string> = {
  [ERRORS.PARAMETRES_INVALIDES]: 'Invalid parameters',
  [ERRORS.ERREUR_INTERNE_SERVEUR]: 'Internal server error',
}
