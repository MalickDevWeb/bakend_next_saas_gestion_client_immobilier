import { EntiteDocument } from '@/src/domaine/entites/EntiteDocument'

export interface InterfaceDaoDocument {
  lister(): Promise<EntiteDocument[]>
  rechercherParId(id: string): Promise<EntiteDocument | null>
  sauvegarder(entite: EntiteDocument): Promise<EntiteDocument>
  supprimerParId(id: string): Promise<void>
}
