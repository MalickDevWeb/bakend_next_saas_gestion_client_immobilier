import { EntiteNotification } from '@/src/domaine/entites/systeme/EntiteNotification'

export interface InterfaceDaoNotification {
  lister(): Promise<EntiteNotification[]>
  rechercherParId(id: string): Promise<EntiteNotification | null>
  sauvegarder(entite: EntiteNotification): Promise<EntiteNotification>
  supprimerParId(id: string): Promise<void>
}
