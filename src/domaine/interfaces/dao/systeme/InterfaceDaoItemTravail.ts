import { EntiteItemTravail } from '@/src/domaine/entites/systeme/EntiteItemTravail'

export interface InterfaceDaoItemTravail {
  lister(): Promise<EntiteItemTravail[]>
  rechercherParId(id: string): Promise<EntiteItemTravail | null>
  sauvegarder(entite: EntiteItemTravail): Promise<EntiteItemTravail>
  supprimerParId(id: string): Promise<void>
}
