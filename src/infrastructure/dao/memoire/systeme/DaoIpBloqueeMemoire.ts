import { EntiteIpBloquee } from '@/src/domaine/entites/systeme/EntiteIpBloquee'
import { InterfaceDaoIpBloquee } from '@/src/domaine/interfaces/dao/systeme/InterfaceDaoIpBloquee'

export class DaoIpBloqueeMemoire implements InterfaceDaoIpBloquee {
  private readonly elements = new Map<string, EntiteIpBloquee>()

  public async lister(): Promise<EntiteIpBloquee[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteIpBloquee | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteIpBloquee): Promise<EntiteIpBloquee> {
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
