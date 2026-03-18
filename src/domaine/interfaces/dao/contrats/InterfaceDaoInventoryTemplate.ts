import { EntiteInventoryTemplate } from '@/src/domaine/entites/contrats/EntiteInventoryTemplate'

export interface InterfaceDaoInventoryTemplate {
  listerParAdmin(adminId: string): Promise<EntiteInventoryTemplate[]>
  rechercherParId(id: string): Promise<EntiteInventoryTemplate | null>
  sauvegarder(entite: EntiteInventoryTemplate): Promise<EntiteInventoryTemplate>
  supprimerParId(id: string): Promise<void>
}
