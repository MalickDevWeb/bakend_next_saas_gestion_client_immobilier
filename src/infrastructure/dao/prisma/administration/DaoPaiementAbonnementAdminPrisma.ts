import { PrismaClient } from '@prisma/client'
import { EntitePaiementAbonnementAdmin } from '@/src/domaine/entites/administration/EntitePaiementAbonnementAdmin'
import { InterfaceDaoPaiementAbonnementAdmin } from '@/src/domaine/interfaces/dao/administration/InterfaceDaoPaiementAbonnementAdmin'
import {
  mapperPaiementAbonnementDepuisPrisma,
  mapperPaiementAbonnementVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

type TypeLignePaiementAbonnementPrisma = Parameters<typeof mapperPaiementAbonnementDepuisPrisma>[0]
type TypeBasePaiementAbonnementPrisma = ReturnType<typeof mapperPaiementAbonnementVersPrisma>

type TypeDelegatePaiementAbonnementAdminPrisma = {
  findMany(args: { orderBy: { creeLe: 'asc' | 'desc' } }): Promise<TypeLignePaiementAbonnementPrisma[]>
  findUnique(args: { where: { id: string } }): Promise<TypeLignePaiementAbonnementPrisma | null>
  upsert(args: {
    where: { id: string }
    create: TypeBasePaiementAbonnementPrisma
    update: Partial<TypeBasePaiementAbonnementPrisma>
  }): Promise<TypeLignePaiementAbonnementPrisma>
  deleteMany(args: { where: { id: string } }): Promise<{ count: number }>
}

export class DaoPaiementAbonnementAdminPrisma implements InterfaceDaoPaiementAbonnementAdmin {
  constructor(private readonly prisma: PrismaClient) {}

  private get delegatePaiementAbonnementAdmin(): TypeDelegatePaiementAbonnementAdminPrisma {
    return (this.prisma as unknown as {
      paiementAbonnementAdmin: TypeDelegatePaiementAbonnementAdminPrisma
    }).paiementAbonnementAdmin
  }

  public async lister(): Promise<EntitePaiementAbonnementAdmin[]> {
    const elements = await this.delegatePaiementAbonnementAdmin.findMany({
      orderBy: { creeLe: 'desc' },
    })

    return elements.map((element: TypeLignePaiementAbonnementPrisma) =>
      mapperPaiementAbonnementDepuisPrisma(element)
    )
  }

  public async rechercherParId(id: string): Promise<EntitePaiementAbonnementAdmin | null> {
    const element = await this.delegatePaiementAbonnementAdmin.findUnique({
      where: { id: String(id || '').trim() },
    })

    if (!element) return null
    return mapperPaiementAbonnementDepuisPrisma(element)
  }

  public async sauvegarder(entite: EntitePaiementAbonnementAdmin): Promise<EntitePaiementAbonnementAdmin> {
    const base = mapperPaiementAbonnementVersPrisma(entite)

    const element = await this.delegatePaiementAbonnementAdmin.upsert({
      where: { id: entite.id },
      create: base,
      update: {
        adminId: base.adminId,
        montant: base.montant,
        methode: base.methode,
        mois: base.mois,
        entrepriseId: base.entrepriseId,
        statut: base.statut,
        fournisseur: base.fournisseur,
        referenceFournisseur: base.referenceFournisseur,
        urlPaiement: base.urlPaiement,
        telephonePayeur: base.telephonePayeur,
        referenceTransaction: base.referenceTransaction,
        note: base.note,
        payeLe: base.payeLe,
        approuveLe: base.approuveLe,
        approuvePar: base.approuvePar,
        modeAbonnement: base.modeAbonnement,
        creeLe: base.creeLe,
      },
    })

    return mapperPaiementAbonnementDepuisPrisma(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.delegatePaiementAbonnementAdmin.deleteMany({
      where: { id: String(id || '').trim() },
    })
  }
}
