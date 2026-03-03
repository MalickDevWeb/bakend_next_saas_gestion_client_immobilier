export const STATUS = {
  OK: 'status.ok',
  DEGRADE: 'status.degrade',
  BASE_DONNEES_DISPONIBLE: 'status.base_de_donnees_disponible',
  BASE_DONNEES_INDISPONIBLE: 'status.base_de_donnees_indisponible',
} as const

export const STATUS_FR: Record<string, string> = {
  [STATUS.OK]: 'ok',
  [STATUS.DEGRADE]: 'degrade',
  [STATUS.BASE_DONNEES_DISPONIBLE]: 'disponible',
  [STATUS.BASE_DONNEES_INDISPONIBLE]: 'indisponible',
}

export const STATUS_EN: Record<string, string> = {
  [STATUS.OK]: 'ok',
  [STATUS.DEGRADE]: 'degraded',
  [STATUS.BASE_DONNEES_DISPONIBLE]: 'up',
  [STATUS.BASE_DONNEES_INDISPONIBLE]: 'down',
}
