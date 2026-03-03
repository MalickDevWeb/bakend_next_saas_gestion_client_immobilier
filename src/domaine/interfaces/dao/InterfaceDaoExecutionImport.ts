import { EntiteExecutionImport } from '@/src/domaine/entites/EntiteExecutionImport'

export interface InterfaceDaoExecutionImport {
  lister(): Promise<EntiteExecutionImport[]>
  rechercherParId(id: string): Promise<EntiteExecutionImport | null>
  sauvegarder(entite: EntiteExecutionImport): Promise<EntiteExecutionImport>
  supprimerParId(id: string): Promise<void>
}
