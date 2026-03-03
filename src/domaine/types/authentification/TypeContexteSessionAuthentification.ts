import { DtoUtilisateurAuthentifie } from '@/src/application/dtos/authentification/DtoAuthentification'

export type TypeContexteSessionAuthentification = {
  utilisateur: DtoUtilisateurAuthentifie
  session: {
    id: string
    csrfToken: string
    secondeAuthValideeLe: Date | null
    expireLe: Date
  }
}
