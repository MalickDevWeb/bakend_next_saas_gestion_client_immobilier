export const PAGES = {
  SANTE: 'pages.sante',
  DOCUMENTATION: 'pages.documentation',
} as const

export const PAGES_FR: Record<string, string> = {
  [PAGES.SANTE]: 'Sante',
  [PAGES.DOCUMENTATION]: 'Documentation',
}

export const PAGES_EN: Record<string, string> = {
  [PAGES.SANTE]: 'Health',
  [PAGES.DOCUMENTATION]: 'Documentation',
}
