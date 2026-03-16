import { PrismaClient } from '@prisma/client'
import { EntiteContractTemplate } from '@/src/domaine/entites/contrats/EntiteContractTemplate'
import { InterfaceDaoContractTemplate } from '@/src/domaine/interfaces/dao/contrats/InterfaceDaoContractTemplate'
import {
  mapperContractTemplateDepuisPrisma,
  mapperContractTemplateVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoContractTemplatePrisma implements InterfaceDaoContractTemplate {
  constructor(private readonly prisma: PrismaClient) {}

  public async listerParAdmin(adminId: string): Promise<EntiteContractTemplate[]> {
    const rows = await this.prisma.contractTemplate.findMany({
      where: { adminId: String(adminId || '').trim() },
      orderBy: { misAJourLe: 'desc' },
    })
    return rows.map(mapperContractTemplateDepuisPrisma)
  }

  public async rechercherParId(id: string): Promise<EntiteContractTemplate | null> {
    const row = await this.prisma.contractTemplate.findUnique({
      where: { id: String(id || '').trim() },
    })
    return row ? mapperContractTemplateDepuisPrisma(row) : null
  }

  public async sauvegarder(entite: EntiteContractTemplate): Promise<EntiteContractTemplate> {
    const data = mapperContractTemplateVersPrisma(entite)
    const row = await this.prisma.contractTemplate.upsert({
      where: { id: entite.id },
      create: data,
      update: data,
    })
    return mapperContractTemplateDepuisPrisma(row)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.contractTemplate.deleteMany({
      where: { id: String(id || '').trim() },
    })
  }
}
