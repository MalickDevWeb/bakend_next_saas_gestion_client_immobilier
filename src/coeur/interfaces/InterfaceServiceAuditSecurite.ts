export type TypeEntreeAuditSecurite = {
  utilisateurId?: string | null
  action: string
  statut: string
  details?: string
  adresseIp?: string
  agentUtilisateur?: string
}

export interface InterfaceServiceAuditSecurite {
  enregistrer(entree: TypeEntreeAuditSecurite): Promise<void>
}
