import { EntiteUtilisateur } from '@/src/domaine/entites/utilisateurs/EntiteUtilisateur'

export interface InterfaceReferentielUtilisateur {
  sauvegarder(utilisateur: EntiteUtilisateur): Promise<EntiteUtilisateur>
  rechercherParEmail(email: string): Promise<EntiteUtilisateur | null>
}
