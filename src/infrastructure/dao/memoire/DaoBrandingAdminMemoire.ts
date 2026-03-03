import { EntiteBrandingAdmin } from '@/src/domaine/entites/EntiteBrandingAdmin'
import { InterfaceDaoBrandingAdmin } from '@/src/domaine/interfaces/dao/InterfaceDaoBrandingAdmin'

export class DaoBrandingAdminMemoire implements InterfaceDaoBrandingAdmin {
  private readonly elements = new Map<string, EntiteBrandingAdmin>()

  public async lister(): Promise<EntiteBrandingAdmin[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteBrandingAdmin | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteBrandingAdmin): Promise<EntiteBrandingAdmin> {
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
