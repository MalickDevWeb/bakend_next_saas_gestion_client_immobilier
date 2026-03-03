import { EntiteExecutionImport } from '@/src/domaine/entites/systeme/EntiteExecutionImport'
import { InterfaceDaoExecutionImport } from '@/src/domaine/interfaces/dao/systeme/InterfaceDaoExecutionImport'

export class DaoExecutionImportMemoire implements InterfaceDaoExecutionImport {
  private readonly elements = new Map<string, EntiteExecutionImport>()

  public async lister(): Promise<EntiteExecutionImport[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntiteExecutionImport | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntiteExecutionImport): Promise<EntiteExecutionImport> {
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
