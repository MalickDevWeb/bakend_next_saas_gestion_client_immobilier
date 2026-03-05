import { PrismaClient } from '@prisma/client'
import { EntiteIpBloquee } from '@/src/domaine/entites/systeme/EntiteIpBloquee'
import { InterfaceDaoIpBloquee } from '@/src/domaine/interfaces/dao/systeme/InterfaceDaoIpBloquee'
import {
  mapperIpBloqueeDepuisPrisma,
  mapperIpBloqueeVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoIpBloqueePrisma implements InterfaceDaoIpBloquee {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteIpBloquee[]> {
    const elements = await this.prisma.ipBloquee.findMany({
      orderBy: { creeLe: 'desc' },
    })

    return elements.map((element) => mapperIpBloqueeDepuisPrisma(element))
  }

  public async rechercherParId(id: string): Promise<EntiteIpBloquee | null> {
    const element = await this.prisma.ipBloquee.findUnique({
      where: { id: String(id || '').trim() },
    })

    if (!element) return null
    return mapperIpBloqueeDepuisPrisma(element)
  }

  public async sauvegarder(entite: EntiteIpBloquee): Promise<EntiteIpBloquee> {
    const base = mapperIpBloqueeVersPrisma(entite)

    const element = await this.prisma.ipBloquee.upsert({
      where: { id: entite.id },
      create: base,
      update: {
        adresseIp: base.adresseIp,
        raison: base.raison,
        creeLe: base.creeLe,
      },
    })

    return mapperIpBloqueeDepuisPrisma(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.ipBloquee.deleteMany({
      where: { id: String(id || '').trim() },
    })
  }
}
