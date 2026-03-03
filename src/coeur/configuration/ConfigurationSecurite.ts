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
    return this.nombreEntier(process.env.AUTH_SUPER_ADMIN_2FA_TTL_MS, 60 * 1000)
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

  private nombreEntier(valeurBrute: string | undefined, valeurParDefaut: number): number {
    const valeur = Number(valeurBrute)
    if (!Number.isFinite(valeur) || valeur <= 0) return valeurParDefaut
    return Math.floor(valeur)
  }
}
