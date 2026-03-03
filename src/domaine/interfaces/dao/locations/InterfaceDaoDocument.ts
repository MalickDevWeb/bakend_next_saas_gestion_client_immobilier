import { EntiteDocument } from '@/src/domaine/entites/locations/EntiteDocument'

export interface InterfaceDaoDocument {
  lister(): Promise<EntiteDocument[]>
  rechercherParId(id: string): Promise<EntiteDocument | null>
  sauvegarder(entite: EntiteDocument): Promise<EntiteDocument>
  supprimerParId(id: string): Promise<void>
}
