export class ConfigurationSecurite {
  public cleJwt(): string {
    return process.env.AUTH_JWT_SECRET || process.env.AUTH_SECRET || 'dev-jwt-secret-a-remplacer'
  }

  public cleChiffrementTotp(): string {
    return (
      process.env.AUTH_TOTP_ENCRYPTION_KEY ||
      process.env.AUTH_SECRET ||
      'dev-chiffrement-totp-a-remplacer'
    )
  }

  public dureeJetonAccesSecondes(): number {
    return this.nombreEntier(process.env.AUTH_ACCESS_TOKEN_TTL_SEC, 15 * 60)
  }

  public dureeSessionSecondes(): number {
    return this.nombreEntier(process.env.AUTH_SESSION_TTL_SEC, 7 * 24 * 60 * 60)
  }

  public dureeJetonRefreshSecondes(): number {
    return this.nombreEntier(process.env.AUTH_REFRESH_TOKEN_TTL_SEC, 30 * 24 * 60 * 60)
  }

  public dureeSecondeAuthSuperAdminMillisecondes(): number {
    // 30 minutes par défaut pour éviter une redemande 2FA quasi immédiate à chaque action.
    return this.nombreEntier(process.env.AUTH_SUPER_ADMIN_2FA_TTL_MS, 30 * 60 * 1000)
  }

  public limiteEchecsConnexion(): number {
    return this.nombreEntier(process.env.AUTH_MAX_FAILED_ATTEMPTS, 5)
  }

  public fenetreEchecsSecondes(): number {
    return this.nombreEntier(process.env.AUTH_FAILED_WINDOW_SEC, 10 * 60)
  }

  public dureeBlocageSecondes(): number {
    return this.nombreEntier(process.env.AUTH_LOCK_DURATION_SEC, 15 * 60)
  }

  public modeCookieSecurise(): boolean {
    const environnement = String(process.env.NODE_ENV || '').toLowerCase()
    return environnement === 'production'
  }

  public modeSameSiteCookies(): 'strict' | 'lax' {
    const valeur = String(process.env.AUTH_COOKIE_SAME_SITE || 'strict').toLowerCase()
    return valeur === 'lax' ? 'lax' : 'strict'
  }

  public cheminsExemptesCsrf(): string[] {
    return [
      '/api/authContext/login',
      '/authContext/login',
      '/api/auth/login',
      '/auth/login',
      '/api/auth/pending-check',
      '/auth/pending-check',
      '/api/admin_requests',
      '/admin_requests',
      '/api/sign',
      '/sign',
      '/api/sante',
      '/api/documentation',
    ]
  }

  public originesCorsAutorisees(): string[] {
    const brute = String(process.env.CORS_ORIGINES_AUTORISEES || '')
    if (!brute.trim()) return []
    return brute
      .split(',')
      .map((valeur) => valeur.trim())
      .filter(Boolean)
  }

  public urlWebhookAlertes(): string {
    return String(process.env.ALERTE_SECURITE_WEBHOOK_URL || '').trim()
  }

  public urlWebhookAlertesSuperAdmin(): string {
    const dedie = String(process.env.ALERTE_SUPER_ADMIN_WEBHOOK_URL || '').trim()
    if (dedie) return dedie
    return this.urlWebhookAlertes()
  }

  public cooldownAlerteSanteSuperAdminMillisecondes(): number {
    return this.nombreEntier(process.env.SUPER_ADMIN_SANTE_ALERT_COOLDOWN_MS, 15 * 60 * 1000)
  }

  public cleCronRapportHebdoSuperAdmin(): string {
    return String(process.env.SUPER_ADMIN_REPORT_CRON_SECRET || '').trim()
  }

  public whatsappCloudApiToken(): string {
    return String(process.env.WHATSAPP_CLOUD_API_TOKEN || '').trim()
  }

  public whatsappCloudPhoneNumberId(): string {
    return String(process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID || '').trim()
  }

  public whatsappCloudDestination(): string {
    return String(process.env.WHATSAPP_CLOUD_DESTINATION || '').trim()
  }

  public whatsappCloudApiVersion(): string {
    const valeur = String(process.env.WHATSAPP_CLOUD_API_VERSION || 'v22.0').trim()
    return valeur || 'v22.0'
  }

  private nombreEntier(valeurBrute: string | undefined, valeurParDefaut: number): number {
    const valeur = Number(valeurBrute)
    if (!Number.isFinite(valeur) || valeur <= 0) return valeurParDefaut
    return Math.floor(valeur)
  }
}
