import { EntitePaiementAbonnementAdmin } from '@/src/domaine/entites/administration/EntitePaiementAbonnementAdmin'

export interface InterfaceDaoPaiementAbonnementAdmin {
  lister(): Promise<EntitePaiementAbonnementAdmin[]>
  rechercherParId(id: string): Promise<EntitePaiementAbonnementAdmin | null>
  sauvegarder(entite: EntitePaiementAbonnementAdmin): Promise<EntitePaiementAbonnementAdmin>
  supprimerParId(id: string): Promise<void>
}
