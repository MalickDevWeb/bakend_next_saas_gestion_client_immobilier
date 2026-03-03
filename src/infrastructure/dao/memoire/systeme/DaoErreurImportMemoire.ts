import { EntiteErreurImport } from '@/src/domaine/entites/systeme/EntiteErreurImport'
import { InterfaceDaoErreurImport } from '@/src/domaine/interfaces/dao/systeme/InterfaceDaoErreurImport'

export class DaoErreurImportMemoire implements InterfaceDaoErreurImport {
  private readonly elements = new Map<string, EntiteErreurImport>()

  public async lister(): Promise<EntiteErreurImport[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteErreurImport | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteErreurImport): Promise<EntiteErreurImport> {
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
