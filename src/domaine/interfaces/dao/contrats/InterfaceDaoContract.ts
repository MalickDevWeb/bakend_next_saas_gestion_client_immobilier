import { EntiteContract } from '@/src/domaine/entites/contrats/EntiteContract'

export interface InterfaceDaoContract {
  listerParAdmin(adminId: string): Promise<EntiteContract[]>
  listerParClient(adminId: string, clientId: string): Promise<EntiteContract[]>
  rechercherParId(id: string): Promise<EntiteContract | null>
  sauvegarder(entite: EntiteContract): Promise<EntiteContract>
  supprimerParId(id: string): Promise<void>
}
