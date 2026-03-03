import { EntiteItemTravail } from '@/src/domaine/entites/EntiteItemTravail'

export interface InterfaceDaoItemTravail {
  lister(): Promise<EntiteItemTravail[]>
  rechercherParId(id: string): Promise<EntiteItemTravail | null>
  sauvegarder(entite: EntiteItemTravail): Promise<EntiteItemTravail>
  supprimerParId(id: string): Promise<void>
}
