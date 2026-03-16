import { EntiteContractTemplate } from '@/src/domaine/entites/contrats/EntiteContractTemplate'

export interface InterfaceDaoContractTemplate {
  listerParAdmin(adminId: string): Promise<EntiteContractTemplate[]>
  rechercherParId(id: string): Promise<EntiteContractTemplate | null>
  sauvegarder(entite: EntiteContractTemplate): Promise<EntiteContractTemplate>
  supprimerParId(id: string): Promise<void>
}
