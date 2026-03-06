export type TypeRoleDestinataireNotification = 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN'

export type TypeDestinataireNotification = {
  email: string
  nom?: string
  role?: TypeRoleDestinataireNotification
}

export type TypeEntreeNotification = {
  evenement: string
  sujet: string
  message: string
  details?: Record<string, unknown>
  tags?: string[]
  destinataires: TypeDestinataireNotification[]
}

export interface InterfaceNotification {
  estConfigure(): boolean
  notifier(entree: TypeEntreeNotification): Promise<boolean>
}
