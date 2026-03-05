import { PrismaClient } from '@prisma/client'
import { EntiteStatutAbonnementAdmin } from '@/src/domaine/entites/administration/EntiteStatutAbonnementAdmin'
import { InterfaceDaoStatutAbonnementAdmin } from '@/src/domaine/interfaces/dao/administration/InterfaceDaoStatutAbonnementAdmin'
import {
  mapperStatutAbonnementDepuisPrisma,
  mapperStatutAbonnementVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoStatutAbonnementAdminPrisma implements InterfaceDaoStatutAbonnementAdmin {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteStatutAbonnementAdmin[]> {
    const elements = await this.prisma.statutAbonnementAdmin.findMany({
      orderBy: { misAJourLe: 'desc' },
    })

    return elements.map((element) => mapperStatutAbonnementDepuisPrisma(element))
  }

  public async rechercherParId(id: string): Promise<EntiteStatutAbonnementAdmin | null> {
    const element = await this.prisma.statutAbonnementAdmin.findUnique({
      where: { adminId: String(id || '').trim() },
    })

    if (!element) return null
    return mapperStatutAbonnementDepuisPrisma(element)
  }

  public async sauvegarder(entite: EntiteStatutAbonnementAdmin): Promise<EntiteStatutAbonnementAdmin> {
    const base = mapperStatutAbonnementVersPrisma(entite)

    const element = await this.prisma.statutAbonnementAdmin.upsert({
      where: { adminId: entite.adminId },
      create: base,
      update: {
        bloque: base.bloque,
        moisEnRetard: base.moisEnRetard,
        echeance: base.echeance,
        moisRequis: base.moisRequis,
        moisCourant: base.moisCourant,
        joursGrace: base.joursGrace,
        modeAbonnement: base.modeAbonnement,
        montantAttendu: base.montantAttendu,
        autoriserMontantLibre: base.autoriserMontantLibre,
      },
    })

    return mapperStatutAbonnementDepuisPrisma(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.statutAbonnementAdmin.deleteMany({
      where: { adminId: String(id || '').trim() },
    })
  }
}
