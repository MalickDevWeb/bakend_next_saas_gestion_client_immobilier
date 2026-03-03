import { DtoReponseUtilisateur } from '@/src/application/dtos/DtoReponseUtilisateur'
import { EntiteUtilisateur } from '@/src/domaine/entites/EntiteUtilisateur'

export class MappeurUtilisateur {
  public static versDtoReponse(entite: EntiteUtilisateur): DtoReponseUtilisateur {
    return {
      id: entite.id,
      email: entite.email.valeur,
      role: entite.role,
      creeLe: entite.creeLe,
    }
  }
}
