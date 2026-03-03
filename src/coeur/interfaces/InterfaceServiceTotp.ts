export interface InterfaceServiceTotp {
  genererSecret(): string
  genererOtpAuthUrl(nomApplication: string, nomUtilisateur: string, secret: string): string
  verifierCode(code: string, secret: string): boolean
}
