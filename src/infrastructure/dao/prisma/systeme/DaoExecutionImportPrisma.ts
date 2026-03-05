import { PrismaClient } from '@prisma/client'
import { EntiteExecutionImport } from '@/src/domaine/entites/systeme/EntiteExecutionImport'
import { InterfaceDaoExecutionImport } from '@/src/domaine/interfaces/dao/systeme/InterfaceDaoExecutionImport'
import {
  mapperExecutionImportDepuisPrisma,
  mapperExecutionImportVersPrisma,
  serialiserDonneesBrutesErreur,
} from '@/src/infrastructure/dao/prisma/commun/SerialisationEntitesAdministration'

const INCLUSIONS = {
  lignesInserees: {
    orderBy: { creeLe: 'asc' as const },
  },
  erreurs: {
    orderBy: { numeroLigne: 'asc' as const },
    include: {
      messages: {
        orderBy: { ordre: 'asc' as const },
      },
    },
  },
} as const

export class DaoExecutionImportPrisma implements InterfaceDaoExecutionImport {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteExecutionImport[]> {
    const elements = await this.prisma.executionImport.findMany({
      orderBy: { creeLe: 'desc' },
      include: INCLUSIONS,
    })

    return elements.map((element) => mapperExecutionImportDepuisPrisma(element))
  }

  public async rechercherParId(id: string): Promise<EntiteExecutionImport | null> {
    const element = await this.prisma.executionImport.findUnique({
      where: { id: String(id || '').trim() },
      include: INCLUSIONS,
    })

    if (!element) return null
    return mapperExecutionImportDepuisPrisma(element)
  }

  public async sauvegarder(entite: EntiteExecutionImport): Promise<EntiteExecutionImport> {
    await this.prisma.$transaction(async (tx) => {
      const base = mapperExecutionImportVersPrisma(entite)

      await tx.executionImport.upsert({
        where: { id: entite.id },
        create: base,
        update: {
          adminId: base.adminId,
          nomFichier: base.nomFichier,
          nombreLignesTotal: base.nombreLignesTotal,
          ignoree: base.ignoree,
          lectureReussie: base.lectureReussie,
          lectureAvecErreurs: base.lectureAvecErreurs,
          creeLe: base.creeLe,
          misAJourLe: base.misAJourLe,
        },
      })

      await tx.ligneImportee.deleteMany({
        where: { executionImportId: entite.id },
      })

      await tx.erreurImport.deleteMany({
        where: { executionImportId: entite.id },
      })

      for (const ligne of entite.lignesInserees) {
        await tx.ligneImportee.create({
          data: {
            id: ligne.id,
            executionImportId: entite.id,
            prenom: ligne.prenom,
            nom: ligne.nom,
            telephone: ligne.telephone,
            email: ligne.email || null,
          },
        })
      }

      for (const erreur of entite.erreurs) {
        const erreurInseree = await tx.erreurImport.create({
          data: {
            executionImportId: entite.id,
            numeroLigne: erreur.numeroLigne,
            donneesBrutesTexte: serialiserDonneesBrutesErreur(erreur.donneesBrutes),
          },
        })

        for (let index = 0; index < erreur.erreurs.length; index += 1) {
          await tx.messageErreurImport.create({
            data: {
              erreurImportId: erreurInseree.id,
              message: erreur.erreurs[index] || '',
              ordre: index,
            },
          })
        }
      }
    })

    const recharge = await this.rechercherParId(entite.id)
    if (!recharge) {
      throw new Error('Execution import introuvable apres sauvegarde')
    }

    return recharge
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.executionImport.deleteMany({
      where: { id: String(id || '').trim() },
    })
  }
}
