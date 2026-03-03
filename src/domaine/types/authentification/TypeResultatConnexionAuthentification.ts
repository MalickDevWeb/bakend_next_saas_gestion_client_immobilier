import { DtoUtilisateurAuthentifie } from '@/src/application/dtos/authentification/DtoAuthentification'

export type TypeResultatConnexionAuthentification = {
  user: DtoUtilisateurAuthentifie | null
  jetonAcces: string
  jetonRefresh: string
  csrfToken: string
}
