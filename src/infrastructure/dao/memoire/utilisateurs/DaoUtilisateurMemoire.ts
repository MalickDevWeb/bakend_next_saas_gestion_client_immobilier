import { EntiteUtilisateur } from '@/src/domaine/entites/utilisateurs/EntiteUtilisateur'
import { InterfaceDaoUtilisateur } from '@/src/domaine/interfaces/dao/utilisateurs/InterfaceDaoUtilisateur'

export class DaoUtilisateurMemoire implements InterfaceDaoUtilisateur {
  private readonly elements = new Map<string, EntiteUtilisateur>()

  public async lister(): Promise<EntiteUtilisateur[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteUtilisateur | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteUtilisateur): Promise<EntiteUtilisateur> {
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
