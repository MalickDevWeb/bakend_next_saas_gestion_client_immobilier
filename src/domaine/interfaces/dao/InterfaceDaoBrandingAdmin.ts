import { EntiteBrandingAdmin } from '@/src/domaine/entites/EntiteBrandingAdmin'

export interface InterfaceDaoBrandingAdmin {
  lister(): Promise<EntiteBrandingAdmin[]>
  rechercherParId(id: string): Promise<EntiteBrandingAdmin | null>
  sauvegarder(entite: EntiteBrandingAdmin): Promise<EntiteBrandingAdmin>
  supprimerParId(id: string): Promise<void>
}
