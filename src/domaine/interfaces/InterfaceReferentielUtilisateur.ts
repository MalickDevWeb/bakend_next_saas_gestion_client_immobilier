import { EntiteUtilisateur } from '@/src/domaine/entites/EntiteUtilisateur'

export interface InterfaceReferentielUtilisateur {
  sauvegarder(utilisateur: EntiteUtilisateur): Promise<EntiteUtilisateur>
  rechercherParEmail(email: string): Promise<EntiteUtilisateur | null>
}
