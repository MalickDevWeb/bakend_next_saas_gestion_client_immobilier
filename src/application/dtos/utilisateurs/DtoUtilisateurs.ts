import { EntiteUtilisateur } from '@/src/domaine/entites/utilisateurs/EntiteUtilisateur'

export interface DtoUtilisateur {
  donnees: EntiteUtilisateur
}

export interface DtoCreationUtilisateur {
  email: string
  motDePasse: string
}

export interface DtoReponseUtilisateur {
  id: string
  email: string
  role: string
  creeLe: Date
}
