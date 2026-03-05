import { PrismaClient, TypeStatutAdmin } from '@prisma/client'
import { BuilderEntiteDemandeAdmin } from '@/src/domaine/builders'
import { EntiteDemandeAdmin } from '@/src/domaine/entites/administration/EntiteDemandeAdmin'
import { InterfaceDaoDemandeAdmin } from '@/src/domaine/interfaces/dao/administration/InterfaceDaoDemandeAdmin'

export class DaoDemandeAdminPrisma implements InterfaceDaoDemandeAdmin {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteDemandeAdmin[]> {
    const elements = await this.prisma.demandeAdmin.findMany({
      orderBy: { creeLe: 'desc' },
    })
    return elements.map((element) => this.mapperVersEntite(element))
  }

  public async rechercherParId(id: string): Promise<EntiteDemandeAdmin | null> {
    const element = await this.prisma.demandeAdmin.findUnique({
      where: { id: String(id || '').trim() },
    })
    if (!element) return null
    return this.mapperVersEntite(element)
  }

  public async sauvegarder(entite: EntiteDemandeAdmin): Promise<EntiteDemandeAdmin> {
    const element = await this.prisma.demandeAdmin.upsert({
      where: { id: entite.id },
      create: {
        id: entite.id,
        nom: entite.nom,
        email: entite.email || null,
        telephone: entite.telephone || null,
        nomEntreprise: entite.nomEntreprise || null,
        statut: entite.statut as TypeStatutAdmin,
        nomUtilisateur: entite.nomUtilisateur || null,
        motDePasse: entite.motDePasse || null,
        paye: entite.paye,
        payeLe: entite.payeLe || null,
      },
      update: {
        nom: entite.nom,
        email: entite.email || null,
        telephone: entite.telephone || null,
        nomEntreprise: entite.nomEntreprise || null,
        statut: entite.statut as TypeStatutAdmin,
        nomUtilisateur: entite.nomUtilisateur || null,
        motDePasse: entite.motDePasse || null,
        paye: entite.paye,
        payeLe: entite.payeLe || null,
      },
    })

    return this.mapperVersEntite(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.demandeAdmin.delete({
      where: { id: String(id || '').trim() },
    })
  }

  private mapperVersEntite(element: {
    id: string
    nom: string
    email: string | null
    telephone: string | null
    nomEntreprise: string | null
    statut: TypeStatutAdmin
    nomUtilisateur: string | null
    motDePasse: string | null
    paye: boolean
    payeLe: Date | null
    creeLe: Date
  }): EntiteDemandeAdmin {
    const builder = new BuilderEntiteDemandeAdmin()
      .avecId(element.id)
      .avecNom(element.nom)
      .avecStatut(element.statut)
      .avecPaye(element.paye)
      .avecDateCreation(element.creeLe)

    if (element.email) builder.avecEmail(element.email)
    if (element.telephone) builder.avecTelephone(element.telephone)
    if (element.nomEntreprise) builder.avecNomEntreprise(element.nomEntreprise)
    if (element.nomUtilisateur) builder.avecNomUtilisateur(element.nomUtilisateur)
    if (element.motDePasse) builder.avecMotDePasse(element.motDePasse)
    if (element.payeLe) builder.avecDatePaiement(element.payeLe)

    return builder.construire()
  }
}
