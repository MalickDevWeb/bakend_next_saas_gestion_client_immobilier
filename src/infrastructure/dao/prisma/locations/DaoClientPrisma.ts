import { PrismaClient } from '@prisma/client'
import { EntiteClient } from '@/src/domaine/entites/locations/EntiteClient'
import { InterfaceDaoClient } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoClient'
import {
  mapperClientDepuisPrisma,
  mapperClientVersPrisma,
  mapperDocumentVersPrisma,
  mapperLocationVersPrisma,
  mapperPaiementCautionVersPrisma,
  mapperPaiementMensuelVersPrisma,
  mapperTransactionPaiementVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

const INCLUSIONS_CLIENT = {
  locations: {
    include: {
      paiementsMensuels: {
        include: {
          transactions: true,
        },
      },
      documents: true,
      depots: true,
    },
  },
} as const

const INCLUSIONS_CLIENT_RESUME = {
  locations: {
    select: {
      id: true,
      clientId: true,
      typeBien: true,
      nomBien: true,
      loyerMensuel: true,
      dateDebut: true,
      cautionMontantTotal: true,
      cautionMontantPaye: true,
      paiementsMensuels: {
        select: {
          id: true,
          periodeDebut: true,
          periodeFin: true,
          dateEcheance: true,
          montantDu: true,
          montantPaye: true,
          statut: true,
        },
      },
    },
  },
} as const

export class DaoClientPrisma implements InterfaceDaoClient {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(adminId?: string): Promise<EntiteClient[]> {
    const elements = await this.prisma.client.findMany({
      where: adminId ? { adminId: String(adminId || '').trim() } : undefined,
      orderBy: { creeLe: 'desc' },
      include: INCLUSIONS_CLIENT,
    })

    return elements.map((element) => mapperClientDepuisPrisma(element))
  }

  public async listerResume(adminId?: string): Promise<EntiteClient[]> {
    const elements = await this.prisma.client.findMany({
      where: adminId ? { adminId: String(adminId || '').trim() } : undefined,
      orderBy: { creeLe: 'desc' },
      include: INCLUSIONS_CLIENT_RESUME,
    })

    return elements.map((element) =>
      mapperClientDepuisPrisma({
        ...element,
        locations: element.locations.map((location) => ({
          ...location,
          documents: [],
          depots: [],
          paiementsMensuels: location.paiementsMensuels.map((paiement) => ({
            ...paiement,
            transactions: [],
          })),
        })),
      })
    )
  }

  public async rechercherParId(id: string): Promise<EntiteClient | null> {
    const element = await this.prisma.client.findUnique({
      where: { id: String(id || '').trim() },
      include: INCLUSIONS_CLIENT,
    })

    if (!element) return null
    return mapperClientDepuisPrisma(element)
  }

  public async sauvegarder(entite: EntiteClient): Promise<EntiteClient> {
    await this.prisma.$transaction(async (tx) => {
      const baseClient = mapperClientVersPrisma(entite)

      await tx.client.upsert({
        where: { id: entite.id },
        create: baseClient,
        update: {
          adminId: baseClient.adminId,
          prenom: baseClient.prenom,
          nom: baseClient.nom,
          telephone: baseClient.telephone,
          cni: baseClient.cni,
          email: baseClient.email,
          statut: baseClient.statut,
          creeLe: baseClient.creeLe,
        },
      })

      await tx.location.deleteMany({ where: { clientId: entite.id } })

      for (const location of entite.locations) {
        await tx.location.create({
          data: mapperLocationVersPrisma(location),
        })

        for (const document of location.documents) {
          await tx.document.create({
            data: mapperDocumentVersPrisma(document, location.id),
          })
        }

        for (const depot of location.caution.paiements) {
          await tx.paiementCaution.create({
            data: mapperPaiementCautionVersPrisma(depot, location.id),
          })
        }

        for (const paiementMensuel of location.paiementsMensuels) {
          await tx.paiementMensuel.create({
            data: mapperPaiementMensuelVersPrisma(paiementMensuel),
          })

          for (const transaction of paiementMensuel.transactions) {
            await tx.transactionPaiement.create({
              data: mapperTransactionPaiementVersPrisma(transaction, paiementMensuel.id),
            })
          }
        }
      }
    })

    const recharge = await this.rechercherParId(entite.id)
    if (!recharge) {
      throw new Error('Client introuvable apres sauvegarde')
    }

    return recharge
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.client.deleteMany({
      where: { id: String(id || '').trim() },
    })
  }
}
