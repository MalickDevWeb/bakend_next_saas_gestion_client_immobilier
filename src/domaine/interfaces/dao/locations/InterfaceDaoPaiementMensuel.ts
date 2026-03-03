import { EntitePaiementMensuel } from '@/src/domaine/entites/locations/EntitePaiementMensuel'

export interface InterfaceDaoPaiementMensuel {
  lister(): Promise<EntitePaiementMensuel[]>
  rechercherParId(id: string): Promise<EntitePaiementMensuel | null>
  sauvegarder(entite: EntitePaiementMensuel): Promise<EntitePaiementMensuel>
  supprimerParId(id: string): Promise<void>
}
