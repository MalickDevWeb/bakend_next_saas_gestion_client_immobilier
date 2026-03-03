import { EntiteStatutAbonnementAdmin } from '@/src/domaine/entites/administration/EntiteStatutAbonnementAdmin'

export interface InterfaceDaoStatutAbonnementAdmin {
  lister(): Promise<EntiteStatutAbonnementAdmin[]>
  rechercherParId(id: string): Promise<EntiteStatutAbonnementAdmin | null>
  sauvegarder(entite: EntiteStatutAbonnementAdmin): Promise<EntiteStatutAbonnementAdmin>
  supprimerParId(id: string): Promise<void>
}
