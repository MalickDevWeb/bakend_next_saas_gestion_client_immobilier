export type TypeCanauxNotification = {
  sms: boolean
  email: boolean
  whatsapp: boolean
}

export type TypeEvenementsNotification = {
  maintenance: boolean
  echecConnexion: boolean
  retardPaiement: boolean
  erreurApi: boolean
}

export type TypeTemplatesNotification = {
  maintenance: string
  echecConnexion: string
  retardPaiement: string
  erreurApi: string
}

export type TypeConfigurationNotifications = {
  canaux: TypeCanauxNotification
  evenements: TypeEvenementsNotification
  templates: TypeTemplatesNotification
}
