import { EntiteConfigurationPlateforme } from '@/src/domaine/entites/EntiteConfigurationPlateforme'
import { InterfaceDaoConfigurationPlateforme } from '@/src/domaine/interfaces/dao/InterfaceDaoConfigurationPlateforme'

export class DaoConfigurationPlateformeMemoire implements InterfaceDaoConfigurationPlateforme {
  private readonly elements = new Map<string, EntiteConfigurationPlateforme>()

  public async lister(): Promise<EntiteConfigurationPlateforme[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteConfigurationPlateforme | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteConfigurationPlateforme): Promise<EntiteConfigurationPlateforme> {
    const identifiant = (entite as { id?: string }).id
    if (!identifiant) {
      throw new Error('Identifiant d\'entite manquant')
    }

    this.elements.set(identifiant, entite)
    return entite
  }

  public async supprimerParId(id: string): Promise<void> {
    this.elements.delete(id)
  }
}
