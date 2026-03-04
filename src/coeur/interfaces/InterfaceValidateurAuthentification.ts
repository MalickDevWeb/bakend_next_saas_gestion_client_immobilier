export interface ParametresConnexionAuthentification {
  identifiant: string
  motDePasse: string
}

export interface ParametresSecondeAuthentification {
  identifiant?: string
  codeTotp?: string
  motDePasse?: string
}

export interface ParametresImpersonationAuthentification {
  adminId: string
  adminName: string
  userId?: string | null
}

export interface ParametresActivationTotpSuperAdmin {
  codeTotp: string
  secretTemporaire: string
}

export interface InterfaceValidateurAuthentification {
  parserConnexion(entree: unknown): ParametresConnexionAuthentification
  parserSecondeAuthentification(entree: unknown): ParametresSecondeAuthentification
  parserActivationTotp(entree: unknown): ParametresActivationTotpSuperAdmin
  parserImpersonation(entree: unknown): ParametresImpersonationAuthentification
  parserLimiteAudit(entree: unknown, valeurParDefaut?: number): number
}
