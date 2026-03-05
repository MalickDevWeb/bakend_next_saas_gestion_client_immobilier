import { PrismaClient } from '@prisma/client'
import { EntiteNotification } from '@/src/domaine/entites/systeme/EntiteNotification'
import { InterfaceDaoNotification } from '@/src/domaine/interfaces/dao/systeme/InterfaceDaoNotification'
import {
  mapperNotificationDepuisPrisma,
  mapperNotificationVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoNotificationPrisma implements InterfaceDaoNotification {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteNotification[]> {
    const elements = await this.prisma.notification.findMany({
      orderBy: { creeLe: 'desc' },
    })

    return elements.map((element) => mapperNotificationDepuisPrisma(element))
  }

  public async rechercherParId(id: string): Promise<EntiteNotification | null> {
    const element = await this.prisma.notification.findUnique({
      where: { id: String(id || '').trim() },
    })

    if (!element) return null
    return mapperNotificationDepuisPrisma(element)
  }

  public async sauvegarder(entite: EntiteNotification): Promise<EntiteNotification> {
    const base = mapperNotificationVersPrisma(entite)

    const element = await this.prisma.notification.upsert({
      where: { id: entite.id },
      create: base,
      update: {
        utilisateurId: base.utilisateurId,
        message: base.message,
        type: base.type,
        estLue: base.estLue,
        creeLe: base.creeLe,
      },
    })

    return mapperNotificationDepuisPrisma(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { id: String(id || '').trim() },
    })
  }
}
