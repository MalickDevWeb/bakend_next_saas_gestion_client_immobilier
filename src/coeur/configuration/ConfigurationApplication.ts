export class ConfigurationApplication {
  public static nomApplication(): string {
    return process.env.APP_NAME || 'Backend KYA API'
  }

  public static environnement(): string {
    return process.env.NODE_ENV || 'development'
  }
}
