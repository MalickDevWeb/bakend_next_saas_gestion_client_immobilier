import { PrismaClient } from '@prisma/client'
import { EntiteDocument } from '@/src/domaine/entites/locations/EntiteDocument'
import { InterfaceDaoDocument } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoDocument'
import {
  mapperDocumentDepuisPrisma,
  mapperDocumentVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoDocumentPrisma implements InterfaceDaoDocument {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteDocument[]> {
    const elements = await this.prisma.document.findMany({
      where: { locationId: null },
      orderBy: { creeLe: 'desc' },
    })

    return elements.map((element) => mapperDocumentDepuisPrisma(element))
  }

  public async rechercherParId(id: string): Promise<EntiteDocument | null> {
    const element = await this.prisma.document.findFirst({
      where: {
        id: String(id || '').trim(),
        locationId: null,
      },
    })

    if (!element) return null
    return mapperDocumentDepuisPrisma(element)
  }

  public async sauvegarder(entite: EntiteDocument): Promise<EntiteDocument> {
    const base = mapperDocumentVersPrisma(entite, null)

    const element = await this.prisma.document.upsert({
      where: { id: entite.id },
      create: base,
      update: {
        locationId: null,
        nom: base.nom,
        type: base.type,
        url: base.url,
        dateAjout: base.dateAjout,
        estSigne: base.estSigne,
      },
    })

    return mapperDocumentDepuisPrisma(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.document.deleteMany({
      where: {
        id: String(id || '').trim(),
        locationId: null,
      },
    })
  }
}
