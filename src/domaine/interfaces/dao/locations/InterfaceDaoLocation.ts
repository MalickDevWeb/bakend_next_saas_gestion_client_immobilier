import { EntiteLocation } from '@/src/domaine/entites/locations/EntiteLocation'

export interface InterfaceDaoLocation {
  lister(): Promise<EntiteLocation[]>
  rechercherParId(id: string): Promise<EntiteLocation | null>
  sauvegarder(entite: EntiteLocation): Promise<EntiteLocation>
  supprimerParId(id: string): Promise<void>
}
