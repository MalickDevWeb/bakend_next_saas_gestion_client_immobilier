export const VALEURS_DRIVER_PERSISTANCE_AUTHENTIFICATION = {
  PRISMA: 'prisma',
  MEMOIRE: 'memoire',
} as const

export type TypeDriverPersistanceAuthentification =
  (typeof VALEURS_DRIVER_PERSISTANCE_AUTHENTIFICATION)[keyof typeof VALEURS_DRIVER_PERSISTANCE_AUTHENTIFICATION]
