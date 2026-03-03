import { EntiteClient } from '@/src/domaine/entites/EntiteClient'

export interface InterfaceDaoClient {
  lister(): Promise<EntiteClient[]>
  rechercherParId(id: string): Promise<EntiteClient | null>
  sauvegarder(entite: EntiteClient): Promise<EntiteClient>
  supprimerParId(id: string): Promise<void>
}
