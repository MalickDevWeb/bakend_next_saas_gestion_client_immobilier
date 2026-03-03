import { EntiteEntreprise } from '@/src/domaine/entites/EntiteEntreprise'
import { InterfaceDaoEntreprise } from '@/src/domaine/interfaces/dao/InterfaceDaoEntreprise'

export class DaoEntrepriseMemoire implements InterfaceDaoEntreprise {
  private readonly elements = new Map<string, EntiteEntreprise>()

  public async lister(): Promise<EntiteEntreprise[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteEntreprise | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteEntreprise): Promise<EntiteEntreprise> {
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
