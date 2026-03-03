import { EntiteConfigurationPlateforme } from '@/src/domaine/entites/EntiteConfigurationPlateforme'

export interface InterfaceDaoConfigurationPlateforme {
  lister(): Promise<EntiteConfigurationPlateforme[]>
  rechercherParId(id: string): Promise<EntiteConfigurationPlateforme | null>
  sauvegarder(entite: EntiteConfigurationPlateforme): Promise<EntiteConfigurationPlateforme>
  supprimerParId(id: string): Promise<void>
}
