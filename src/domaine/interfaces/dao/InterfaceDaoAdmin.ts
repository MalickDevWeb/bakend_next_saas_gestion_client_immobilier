import { EntiteAdmin } from '@/src/domaine/entites/EntiteAdmin'

export interface InterfaceDaoAdmin {
  lister(): Promise<EntiteAdmin[]>
  rechercherParId(id: string): Promise<EntiteAdmin | null>
  sauvegarder(entite: EntiteAdmin): Promise<EntiteAdmin>
  supprimerParId(id: string): Promise<void>
}
