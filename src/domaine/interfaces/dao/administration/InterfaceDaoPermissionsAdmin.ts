import { EntitePermissionsAdmin } from '@/src/domaine/entites/administration/EntitePermissionsAdmin'

export interface InterfaceDaoPermissionsAdmin {
  lister(): Promise<EntitePermissionsAdmin[]>
  rechercherParId(id: string): Promise<EntitePermissionsAdmin | null>
  sauvegarder(entite: EntitePermissionsAdmin): Promise<EntitePermissionsAdmin>
  supprimerParId(id: string): Promise<void>
}
