import { PrismaClient } from '@prisma/client'
import { EntitePaiementCaution } from '@/src/domaine/entites/locations/EntitePaiementCaution'
import { InterfaceDaoPaiementCaution } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoPaiementCaution'
import {
  mapperPaiementCautionDepuisPrisma,
  mapperPaiementCautionVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoPaiementCautionPrisma implements InterfaceDaoPaiementCaution {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntitePaiementCaution[]> {
    const elements = await this.prisma.paiementCaution.findMany({
      where: { locationId: null },
      orderBy: { creeLe: 'desc' },
    })

    return elements.map((element) => mapperPaiementCautionDepuisPrisma(element))
  }

  public async rechercherParId(id: string): Promise<EntitePaiementCaution | null> {
    const element = await this.prisma.paiementCaution.findFirst({
      where: {
        id: String(id || '').trim(),
        locationId: null,
      },
    })

    if (!element) return null
    return mapperPaiementCautionDepuisPrisma(element)
  }

  public async sauvegarder(entite: EntitePaiementCaution): Promise<EntitePaiementCaution> {
    const base = mapperPaiementCautionVersPrisma(entite, null)

    const element = await this.prisma.paiementCaution.upsert({
      where: { id: entite.id },
      create: base,
      update: {
        locationId: null,
        montant: base.montant,
        datePaiement: base.datePaiement,
        numeroRecu: base.numeroRecu,
        note: base.note,
        statut: base.statut,
      },
    })

    return mapperPaiementCautionDepuisPrisma(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.paiementCaution.deleteMany({
      where: {
        id: String(id || '').trim(),
        locationId: null,
      },
    })
  }
}
