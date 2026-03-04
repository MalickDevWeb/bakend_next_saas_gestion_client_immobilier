export type TypeMethodeHttpAnnulationAdministrationAdmin = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type TypeMetadonneesActionAnnulationAdministrationAdmin = {
  id: string
  resource: string
  resourceId?: string | null
  method: TypeMethodeHttpAnnulationAdministrationAdmin
  actorId?: string | null
  createdAt: string
  expiresAt: string
  path?: string
}
