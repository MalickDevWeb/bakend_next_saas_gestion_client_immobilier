export type DtoUtilisateurAuthentifie = {
  id: string
  telephone: string
  email: string
  role: string
  statut: string
  permissions: string[]
  superAdminSecondAuthRequired: boolean
}

export type DtoReponseAuthentification = {
  user: DtoUtilisateurAuthentifie | null
}

export type DtoEtatImpersonation = {
  adminId: string
  adminName: string
  userId?: string | null
} | null

export type DtoEntreeConnexion = {
  identifiant: string
  motDePasse: string
}

export type DtoEntreeSecondeAuth = {
  codeTotp: string
}

export type DtoStatutTotpSuperAdmin = {
  totpActive: boolean
}

export type DtoLigneAuditSecurite = {
  id: string
  action: string
  statut: string
  details: string | null
  adresseIp: string | null
  agentUtilisateur: string | null
  creeLe: Date
  utilisateurId: string | null
}

export type DtoListeAuditsSecurite = {
  elements: DtoLigneAuditSecurite[]
  total: number
}
