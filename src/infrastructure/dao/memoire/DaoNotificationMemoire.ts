import { EntiteNotification } from '@/src/domaine/entites/EntiteNotification'
import { InterfaceDaoNotification } from '@/src/domaine/interfaces/dao/InterfaceDaoNotification'

export class DaoNotificationMemoire implements InterfaceDaoNotification {
  private readonly elements = new Map<string, EntiteNotification>()

  public async lister(): Promise<EntiteNotification[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteNotification | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteNotification): Promise<EntiteNotification> {
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
