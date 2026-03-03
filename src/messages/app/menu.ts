export const MENU = {
  SANTE: 'menu.sante',
  DOCUMENTATION: 'menu.documentation',
} as const

export const MENU_FR: Record<string, string> = {
  [MENU.SANTE]: 'Sante',
  [MENU.DOCUMENTATION]: 'Documentation',
}

export const MENU_EN: Record<string, string> = {
  [MENU.SANTE]: 'Health',
  [MENU.DOCUMENTATION]: 'Documentation',
}
