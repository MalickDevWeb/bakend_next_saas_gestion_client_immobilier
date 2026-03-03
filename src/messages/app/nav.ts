export const NAV = {
  RETOUR: 'nav.retour',
} as const

export const NAV_FR: Record<string, string> = {
  [NAV.RETOUR]: 'Retour',
}

export const NAV_EN: Record<string, string> = {
  [NAV.RETOUR]: 'Back',
}
