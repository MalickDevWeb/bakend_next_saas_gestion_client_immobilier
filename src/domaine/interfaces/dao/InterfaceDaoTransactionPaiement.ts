import { EntiteTransactionPaiement } from '@/src/domaine/entites/EntiteTransactionPaiement'

export interface InterfaceDaoTransactionPaiement {
  lister(): Promise<EntiteTransactionPaiement[]>
  rechercherParId(id: string): Promise<EntiteTransactionPaiement | null>
  sauvegarder(entite: EntiteTransactionPaiement): Promise<EntiteTransactionPaiement>
  supprimerParId(id: string): Promise<void>
}
