import { EntiteClient } from '@/src/domaine/entites/locations/EntiteClient'

export interface InterfaceDaoClient {
  lister(adminId?: string): Promise<EntiteClient[]>
  rechercherParId(id: string): Promise<EntiteClient | null>
  sauvegarder(entite: EntiteClient): Promise<EntiteClient>
  supprimerParId(id: string): Promise<void>
}
