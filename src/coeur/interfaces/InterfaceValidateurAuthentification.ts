export interface ParametresConnexionAuthentification {
  identifiant: string
  motDePasse: string
}

export interface ParametresSecondeAuthentification {
  identifiant?: string
  codeTotp?: string
  motDePasse?: string
}

export interface ParametresActivationTotpSuperAdmin {
  codeTotp: string
  secretTemporaire: string
}

export interface InterfaceValidateurAuthentification {
  parserConnexion(entree: unknown): ParametresConnexionAuthentification
  parserSecondeAuthentification(entree: unknown): ParametresSecondeAuthentification
  parserActivationTotp(entree: unknown): ParametresActivationTotpSuperAdmin
  parserLimiteAudit(entree: unknown, valeurParDefaut?: number): number
}
