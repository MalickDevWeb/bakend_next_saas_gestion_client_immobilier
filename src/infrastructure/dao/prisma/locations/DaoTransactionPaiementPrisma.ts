import { PrismaClient } from '@prisma/client'
import { EntiteTransactionPaiement } from '@/src/domaine/entites/locations/EntiteTransactionPaiement'
import { InterfaceDaoTransactionPaiement } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoTransactionPaiement'
import {
  mapperTransactionPaiementDepuisPrisma,
  mapperTransactionPaiementVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoTransactionPaiementPrisma implements InterfaceDaoTransactionPaiement {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteTransactionPaiement[]> {
    const elements = await this.prisma.transactionPaiement.findMany({
      where: { paiementMensuelId: null },
      orderBy: { creeLe: 'desc' },
    })

    return elements.map((element) => mapperTransactionPaiementDepuisPrisma(element))
  }

  public async rechercherParId(id: string): Promise<EntiteTransactionPaiement | null> {
    const element = await this.prisma.transactionPaiement.findFirst({
      where: {
        id: String(id || '').trim(),
        paiementMensuelId: null,
      },
    })

    if (!element) return null
    return mapperTransactionPaiementDepuisPrisma(element)
  }

  public async sauvegarder(entite: EntiteTransactionPaiement): Promise<EntiteTransactionPaiement> {
    const base = mapperTransactionPaiementVersPrisma(entite, null)

    const element = await this.prisma.transactionPaiement.upsert({
      where: { id: entite.id },
      create: base,
      update: {
        paiementMensuelId: null,
        montant: base.montant,
        datePaiement: base.datePaiement,
        numeroRecu: base.numeroRecu,
        description: base.description,
        statut: base.statut,
      },
    })

    return mapperTransactionPaiementDepuisPrisma(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.transactionPaiement.deleteMany({
      where: {
        id: String(id || '').trim(),
        paiementMensuelId: null,
      },
    })
  }
}
