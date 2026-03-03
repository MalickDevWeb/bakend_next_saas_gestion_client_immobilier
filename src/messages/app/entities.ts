export const ENTITIES = {
  SERVICE_SANTE: 'entities.service_sante',
  BASE_DE_DONNEES: 'entities.base_de_donnees',
} as const

export const ENTITIES_FR: Record<string, string> = {
  [ENTITIES.SERVICE_SANTE]: 'Service sante',
  [ENTITIES.BASE_DE_DONNEES]: 'Base de donnees',
}

export const ENTITIES_EN: Record<string, string> = {
  [ENTITIES.SERVICE_SANTE]: 'Health service',
  [ENTITIES.BASE_DE_DONNEES]: 'Database',
}
