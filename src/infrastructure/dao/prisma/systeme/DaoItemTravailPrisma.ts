import { PrismaClient } from '@prisma/client'
import { EntiteItemTravail } from '@/src/domaine/entites/systeme/EntiteItemTravail'
import { InterfaceDaoItemTravail } from '@/src/domaine/interfaces/dao/systeme/InterfaceDaoItemTravail'
import {
  mapperItemTravailDepuisPrisma,
  mapperItemTravailVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoItemTravailPrisma implements InterfaceDaoItemTravail {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteItemTravail[]> {
    const elements = await this.prisma.itemTravail.findMany({
      orderBy: { creeLe: 'desc' },
    })

    return elements.map((element) => mapperItemTravailDepuisPrisma(element))
  }

  public async rechercherParId(id: string): Promise<EntiteItemTravail | null> {
    const element = await this.prisma.itemTravail.findUnique({
      where: { id: String(id || '').trim() },
    })

    if (!element) return null
    return mapperItemTravailDepuisPrisma(element)
  }

  public async sauvegarder(entite: EntiteItemTravail): Promise<EntiteItemTravail> {
    const base = mapperItemTravailVersPrisma(entite)

    const element = await this.prisma.itemTravail.upsert({
      where: { id: entite.id },
      create: base,
      update: {
        titre: base.titre,
        description: base.description,
        priorite: base.priorite,
        statut: base.statut,
        dateEcheance: base.dateEcheance,
        detecteAutomatiquement: base.detecteAutomatiquement,
        creeLe: base.creeLe,
      },
    })

    return mapperItemTravailDepuisPrisma(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.itemTravail.deleteMany({
      where: { id: String(id || '').trim() },
    })
  }
}
