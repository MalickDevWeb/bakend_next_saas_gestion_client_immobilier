import { EntiteEntreprise } from '@/src/domaine/entites/administration/EntiteEntreprise'

export interface InterfaceDaoEntreprise {
  lister(): Promise<EntiteEntreprise[]>
  rechercherParId(id: string): Promise<EntiteEntreprise | null>
  sauvegarder(entite: EntiteEntreprise): Promise<EntiteEntreprise>
  supprimerParId(id: string): Promise<void>
}
