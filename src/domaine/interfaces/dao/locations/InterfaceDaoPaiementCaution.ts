import { EntitePaiementCaution } from '@/src/domaine/entites/locations/EntitePaiementCaution'

export interface InterfaceDaoPaiementCaution {
  lister(): Promise<EntitePaiementCaution[]>
  rechercherParId(id: string): Promise<EntitePaiementCaution | null>
  sauvegarder(entite: EntitePaiementCaution): Promise<EntitePaiementCaution>
  supprimerParId(id: string): Promise<void>
}
