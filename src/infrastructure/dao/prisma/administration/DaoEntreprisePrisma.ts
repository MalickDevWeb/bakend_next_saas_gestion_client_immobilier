import { PrismaClient } from '@prisma/client'
import { BuilderEntiteEntreprise } from '@/src/domaine/builders'
import { EntiteEntreprise } from '@/src/domaine/entites/administration/EntiteEntreprise'
import { InterfaceDaoEntreprise } from '@/src/domaine/interfaces/dao/administration/InterfaceDaoEntreprise'

export class DaoEntreprisePrisma implements InterfaceDaoEntreprise {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteEntreprise[]> {
    const elements = await this.prisma.entreprise.findMany({
      orderBy: { creeLe: 'desc' },
    })
    return elements.map((element) => this.mapperVersEntite(element))
  }

  public async rechercherParId(id: string): Promise<EntiteEntreprise | null> {
    const element = await this.prisma.entreprise.findUnique({
      where: { id: String(id || '').trim() },
    })
    if (!element) return null
    return this.mapperVersEntite(element)
  }

  public async sauvegarder(entite: EntiteEntreprise): Promise<EntiteEntreprise> {
    const element = await this.prisma.entreprise.upsert({
      where: { id: entite.id },
      create: {
        id: entite.id,
        nom: entite.nom,
        adminId: entite.adminId || null,
      },
      update: {
        nom: entite.nom,
        adminId: entite.adminId || null,
      },
    })

    return this.mapperVersEntite(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.entreprise.delete({
      where: { id: String(id || '').trim() },
    })
  }

  private mapperVersEntite(element: {
    id: string
    nom: string
    adminId: string | null
    creeLe: Date
  }): EntiteEntreprise {
    const builder = new BuilderEntiteEntreprise()
      .avecId(element.id)
      .avecNom(element.nom)
      .avecDateCreation(element.creeLe)

    if (element.adminId) {
      builder.avecAdminId(element.adminId)
    }

    return builder.construire()
  }
}
