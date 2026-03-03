import { EntitePaiementMensuel } from '@/src/domaine/entites/locations/EntitePaiementMensuel'
import { InterfaceDaoPaiementMensuel } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoPaiementMensuel'

export class DaoPaiementMensuelMemoire implements InterfaceDaoPaiementMensuel {
  private readonly elements = new Map<string, EntitePaiementMensuel>()

  public async lister(): Promise<EntitePaiementMensuel[]> {
    return Array.from(this.elements.values())
  }

  public async rechercherParId(id: string): Promise<EntitePaiementMensuel | null> {
    return this.elements.get(id) ?? null
  }

  public async sauvegarder(entite: EntitePaiementMensuel): Promise<EntitePaiementMensuel> {
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
