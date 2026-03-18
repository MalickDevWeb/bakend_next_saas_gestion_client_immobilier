import { PrismaClient } from '@prisma/client'
import { EntiteInventoryTemplate } from '@/src/domaine/entites/contrats/EntiteInventoryTemplate'
import { InterfaceDaoInventoryTemplate } from '@/src/domaine/interfaces/dao/contrats/InterfaceDaoInventoryTemplate'
import {
  mapperInventoryTemplateDepuisPrisma,
  mapperInventoryTemplateVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoInventoryTemplatePrisma implements InterfaceDaoInventoryTemplate {
  constructor(private readonly prisma: PrismaClient) {}

  public async listerParAdmin(adminId: string): Promise<EntiteInventoryTemplate[]> {
    const rows = await this.prisma.inventoryTemplate.findMany({ where: { adminId }, orderBy: { misAJourLe: 'desc' } })
    return rows.map(mapperInventoryTemplateDepuisPrisma)
  }

  public async rechercherParId(id: string): Promise<EntiteInventoryTemplate | null> {
    const row = await this.prisma.inventoryTemplate.findUnique({ where: { id } })
    return row ? mapperInventoryTemplateDepuisPrisma(row) : null
  }

  public async sauvegarder(entite: EntiteInventoryTemplate): Promise<EntiteInventoryTemplate> {
    const data = mapperInventoryTemplateVersPrisma(entite)
    const row = await this.prisma.inventoryTemplate.upsert({
      where: { id: entite.id },
      create: data,
      update: data,
    })
    return mapperInventoryTemplateDepuisPrisma(row)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.inventoryTemplate.delete({ where: { id } })
  }
}
