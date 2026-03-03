import { EntiteDemandeAdmin } from '@/src/domaine/entites/administration/EntiteDemandeAdmin'

export interface InterfaceDaoDemandeAdmin {
  lister(): Promise<EntiteDemandeAdmin[]>
  rechercherParId(id: string): Promise<EntiteDemandeAdmin | null>
  sauvegarder(entite: EntiteDemandeAdmin): Promise<EntiteDemandeAdmin>
  supprimerParId(id: string): Promise<void>
}
