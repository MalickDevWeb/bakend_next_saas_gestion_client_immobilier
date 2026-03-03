import { EntiteUtilisateur } from '@/src/domaine/entites/EntiteUtilisateur'

export interface InterfaceDaoUtilisateur {
  lister(): Promise<EntiteUtilisateur[]>
  rechercherParId(id: string): Promise<EntiteUtilisateur | null>
  sauvegarder(entite: EntiteUtilisateur): Promise<EntiteUtilisateur>
  supprimerParId(id: string): Promise<void>
}
