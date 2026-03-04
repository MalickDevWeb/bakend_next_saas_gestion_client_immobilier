export interface InterfaceServiceTotp {
  genererSecret(): string
  genererOtpAuthUrl(nomApplication: string, identifiantCompte: string, secret: string): string
  verifierCode(code: string, secret: string): boolean
}
