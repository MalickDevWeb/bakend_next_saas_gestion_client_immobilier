import { EntiteIpBloquee } from '@/src/domaine/entites/EntiteIpBloquee'

export interface InterfaceDaoIpBloquee {
  lister(): Promise<EntiteIpBloquee[]>
  rechercherParId(id: string): Promise<EntiteIpBloquee | null>
  sauvegarder(entite: EntiteIpBloquee): Promise<EntiteIpBloquee>
  supprimerParId(id: string): Promise<void>
}
