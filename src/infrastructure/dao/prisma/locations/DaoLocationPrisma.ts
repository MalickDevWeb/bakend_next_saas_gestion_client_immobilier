import { PrismaClient } from '@prisma/client'
import { EntiteLocation } from '@/src/domaine/entites/locations/EntiteLocation'
import { InterfaceDaoLocation } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoLocation'
import {
  mapperLocationDepuisPrisma,
  mapperLocationVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoLocationPrisma implements InterfaceDaoLocation {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteLocation[]> {
    const rows = await this.prisma.location.findMany({
      orderBy: { creeLe: 'desc' },
      include: { paiementsMensuels: true, documents: true, depots: true },
    })
    return rows.map((row) => mapperLocationDepuisPrisma(row as any, row.clientId))
  }

  public async rechercherParId(id: string): Promise<EntiteLocation | null> {
    const row = await this.prisma.location.findUnique({
      where: { id: String(id || '').trim() },
      include: { paiementsMensuels: true, documents: true, depots: true },
    })
    if (!row) return null
    return mapperLocationDepuisPrisma(row as any, row.clientId)
  }

  public async sauvegarder(entite: EntiteLocation): Promise<EntiteLocation> {
    const data = mapperLocationVersPrisma(entite)
    const row = await this.prisma.location.upsert({
      where: { id: entite.id },
      create: data,
      update: data,
      include: { paiementsMensuels: true, documents: true, depots: true },
    })
    return mapperLocationDepuisPrisma(row as any, row.clientId)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.location.deleteMany({ where: { id: String(id || '').trim() } })
  }
}
