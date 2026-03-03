import { EntiteErreurImport } from '@/src/domaine/entites/EntiteErreurImport'

export interface InterfaceDaoErreurImport {
  lister(): Promise<EntiteErreurImport[]>
  rechercherParId(id: string): Promise<EntiteErreurImport | null>
  sauvegarder(entite: EntiteErreurImport): Promise<EntiteErreurImport>
  supprimerParId(id: string): Promise<void>
}
