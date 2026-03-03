import {
  TypeDriverPersistanceAuthentification,
  VALEURS_DRIVER_PERSISTANCE_AUTHENTIFICATION,
} from '@/src/domaine/types/authentification/TypeDriverPersistanceAuthentification'

export class ConfigurationApplication {
  public nomApplication(): string {
    return process.env.APP_NAME || 'Backend KYA API'
  }

  public environnement(): string {
    return process.env.NODE_ENV || 'development'
  }

  public driverPersistanceAuthentification(): TypeDriverPersistanceAuthentification {
    const valeur = String(process.env.AUTH_PERSISTENCE_DRIVER || 'prisma')
      .trim()
      .toLowerCase()
    return valeur === VALEURS_DRIVER_PERSISTANCE_AUTHENTIFICATION.MEMOIRE
      ? VALEURS_DRIVER_PERSISTANCE_AUTHENTIFICATION.MEMOIRE
      : VALEURS_DRIVER_PERSISTANCE_AUTHENTIFICATION.PRISMA
  }
}
