import { EntiteCaution } from '@/src/domaine/entites/locations/EntiteCaution'

export interface InterfaceDaoCaution {
  lister(): Promise<EntiteCaution[]>
  rechercherParId(id: string): Promise<EntiteCaution | null>
  sauvegarder(entite: EntiteCaution): Promise<EntiteCaution>
  supprimerParId(id: string): Promise<void>
}
