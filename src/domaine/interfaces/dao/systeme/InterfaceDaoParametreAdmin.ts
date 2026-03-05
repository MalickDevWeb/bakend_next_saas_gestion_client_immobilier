import { TypeEnregistrementParametreAdministrationAdmin } from '@/src/domaine/types/administration/TypeEnregistrementParametreAdministrationAdmin'

export interface InterfaceDaoParametreAdmin {
  listerParAdmin(adminId: string): Promise<TypeEnregistrementParametreAdministrationAdmin[]>
  rechercherParAdminEtId(
    adminId: string,
    id: string
  ): Promise<TypeEnregistrementParametreAdministrationAdmin | null>
  rechercherParAdminEtCle(
    adminId: string,
    cle: string
  ): Promise<TypeEnregistrementParametreAdministrationAdmin | null>
  sauvegarder(
    adminId: string,
    parametre: TypeEnregistrementParametreAdministrationAdmin
  ): Promise<TypeEnregistrementParametreAdministrationAdmin>
  supprimerParAdminEtId(adminId: string, id: string): Promise<void>
}
