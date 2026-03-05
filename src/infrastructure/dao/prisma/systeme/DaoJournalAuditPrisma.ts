import { PrismaClient } from '@prisma/client'
import { EntiteJournalAudit } from '@/src/domaine/entites/systeme/EntiteJournalAudit'
import { InterfaceDaoJournalAudit } from '@/src/domaine/interfaces/dao/systeme/InterfaceDaoJournalAudit'
import {
  mapperJournalAuditDepuisPrisma,
  mapperJournalAuditVersPrisma,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

export class DaoJournalAuditPrisma implements InterfaceDaoJournalAudit {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteJournalAudit[]> {
    const elements = await this.prisma.journalAuditAdmin.findMany({
      orderBy: { creeLe: 'desc' },
    })

    return elements.map((element) => mapperJournalAuditDepuisPrisma(element))
  }

  public async rechercherParId(id: string): Promise<EntiteJournalAudit | null> {
    const element = await this.prisma.journalAuditAdmin.findUnique({
      where: { id: String(id || '').trim() },
    })

    if (!element) return null
    return mapperJournalAuditDepuisPrisma(element)
  }

  public async sauvegarder(entite: EntiteJournalAudit): Promise<EntiteJournalAudit> {
    const base = mapperJournalAuditVersPrisma(entite)

    const element = await this.prisma.journalAuditAdmin.upsert({
      where: { id: entite.id },
      create: base,
      update: {
        acteur: base.acteur,
        action: base.action,
        typeCible: base.typeCible,
        idCible: base.idCible,
        message: base.message,
        adresseIp: base.adresseIp,
        creeLe: base.creeLe,
      },
    })

    return mapperJournalAuditDepuisPrisma(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.journalAuditAdmin.deleteMany({
      where: { id: String(id || '').trim() },
    })
  }
}
