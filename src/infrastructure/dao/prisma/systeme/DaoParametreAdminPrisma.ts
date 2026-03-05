import { PrismaClient } from '@prisma/client'
import { TypeEnregistrementParametreAdministrationAdmin } from '@/src/domaine/types/administration/TypeEnregistrementParametreAdministrationAdmin'
import { InterfaceDaoParametreAdmin } from '@/src/domaine/interfaces/dao/systeme/InterfaceDaoParametreAdmin'

export class DaoParametreAdminPrisma implements InterfaceDaoParametreAdmin {
  constructor(private readonly prisma: PrismaClient) {}

  public async listerParAdmin(
    adminId: string
  ): Promise<TypeEnregistrementParametreAdministrationAdmin[]> {
    const elements = await this.prisma.parametreAdmin.findMany({
      where: { adminId: String(adminId || '').trim() },
      orderBy: { misAJourLe: 'desc' },
    })

    return elements.map((element) => this.mapper(element))
  }

  public async rechercherParAdminEtId(
    adminId: string,
    id: string
  ): Promise<TypeEnregistrementParametreAdministrationAdmin | null> {
    const element = await this.prisma.parametreAdmin.findUnique({
      where: {
        adminId_id: {
          adminId: String(adminId || '').trim(),
          id: String(id || '').trim(),
        },
      },
    })

    if (!element) return null
    return this.mapper(element)
  }

  public async rechercherParAdminEtCle(
    adminId: string,
    cle: string
  ): Promise<TypeEnregistrementParametreAdministrationAdmin | null> {
    const element = await this.prisma.parametreAdmin.findUnique({
      where: {
        adminId_cle: {
          adminId: String(adminId || '').trim(),
          cle: String(cle || '').trim(),
        },
      },
    })

    if (!element) return null
    return this.mapper(element)
  }

  public async sauvegarder(
    adminId: string,
    parametre: TypeEnregistrementParametreAdministrationAdmin
  ): Promise<TypeEnregistrementParametreAdministrationAdmin> {
    const cibleAdminId = String(adminId || '').trim()
    const cibleId = String(parametre.id || '').trim()
    const cle = String(parametre.key || '').trim()
    const valeur = String(parametre.value ?? '')

    const element = await this.prisma.parametreAdmin.upsert({
      where: {
        adminId_id: {
          adminId: cibleAdminId,
          id: cibleId,
        },
      },
      create: {
        adminId: cibleAdminId,
        id: cibleId,
        cle,
        valeur,
        creeLe: parametre.createdAt ? new Date(parametre.createdAt) : new Date(),
      },
      update: {
        cle,
        valeur,
      },
    })

    return this.mapper(element)
  }

  public async supprimerParAdminEtId(adminId: string, id: string): Promise<void> {
    await this.prisma.parametreAdmin.deleteMany({
      where: {
        adminId: String(adminId || '').trim(),
        id: String(id || '').trim(),
      },
    })
  }

  private mapper(element: {
    id: string
    cle: string
    valeur: string
    creeLe: Date
    misAJourLe: Date
  }): TypeEnregistrementParametreAdministrationAdmin {
    return {
      id: element.id,
      key: element.cle,
      value: element.valeur,
      createdAt: element.creeLe.toISOString(),
      updatedAt: element.misAJourLe.toISOString(),
    }
  }
}
