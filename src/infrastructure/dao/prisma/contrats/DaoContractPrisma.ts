import { PrismaClient } from '@prisma/client'
import { EntiteContract } from '@/src/domaine/entites/contrats/EntiteContract'
import { InterfaceDaoContract } from '@/src/domaine/interfaces/dao/contrats/InterfaceDaoContract'
import {
  mapperContractDepuisPrisma,
  mapperContractVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoContractPrisma implements InterfaceDaoContract {
  constructor(private readonly prisma: PrismaClient) {}

  public async listerParAdmin(adminId: string): Promise<EntiteContract[]> {
    const rows = await this.prisma.contract.findMany({
      where: { adminId: String(adminId || '').trim() },
      orderBy: { creeLe: 'desc' },
    })
    return rows.map(mapperContractDepuisPrisma)
  }

  public async listerParClient(adminId: string, clientId: string): Promise<EntiteContract[]> {
    const rows = await this.prisma.contract.findMany({
      where: {
        adminId: String(adminId || '').trim(),
        clientId: String(clientId || '').trim(),
      },
      orderBy: { creeLe: 'desc' },
    })
    return rows.map(mapperContractDepuisPrisma)
  }

  public async rechercherParId(id: string): Promise<EntiteContract | null> {
    const row = await this.prisma.contract.findUnique({
      where: { id: String(id || '').trim() },
    })
    return row ? mapperContractDepuisPrisma(row) : null
  }

  public async sauvegarder(entite: EntiteContract): Promise<EntiteContract> {
    const data = mapperContractVersPrisma(entite)
    const row = await this.prisma.contract.upsert({
      where: { id: entite.id },
      create: data,
      update: data,
    })
    return mapperContractDepuisPrisma(row)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.contract.deleteMany({
      where: { id: String(id || '').trim() },
    })
  }
}
