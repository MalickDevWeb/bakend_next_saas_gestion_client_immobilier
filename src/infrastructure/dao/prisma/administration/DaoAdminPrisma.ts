import { PrismaClient, TypeModeAbonnementAdmin, TypeStatutAdmin } from '@prisma/client'
import { BuilderEntiteAdmin, BuilderEntitePermissionsAdmin } from '@/src/domaine/builders'
import { EntiteAdmin } from '@/src/domaine/entites/administration/EntiteAdmin'
import { InterfaceDaoAdmin } from '@/src/domaine/interfaces/dao/administration/InterfaceDaoAdmin'

const CODES_PERMISSIONS_ADMIN = {
  DASHBOARD: 'DASHBOARD_ACCEDER',
  CLIENTS: 'CLIENTS_GERER',
  LOCATIONS: 'LOCATIONS_GERER',
  PAIEMENTS: 'PAIEMENTS_GERER',
  DOCUMENTS: 'DOCUMENTS_GERER',
  PARAMETRES: 'PARAMETRES_GERER',
  TRAVAUX: 'TRAVAUX_GERER',
  IMPORTS: 'IMPORTS_GERER',
  NOTIFICATIONS: 'NOTIFICATIONS_GERER',
  PDF_EXPORT: 'PDF_EXPORTER',
} as const

export class DaoAdminPrisma implements InterfaceDaoAdmin {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteAdmin[]> {
    const elements = await this.prisma.admin.findMany({
      orderBy: { creeLe: 'desc' },
    })
    return elements.map((element) => this.mapperVersEntite(element))
  }

  public async rechercherParId(id: string): Promise<EntiteAdmin | null> {
    const element = await this.prisma.admin.findUnique({
      where: { id: String(id || '').trim() },
    })
    if (!element) return null
    return this.mapperVersEntite(element)
  }

  public async sauvegarder(entite: EntiteAdmin): Promise<EntiteAdmin> {
    const element = await this.prisma.admin.upsert({
      where: { id: entite.id },
      create: {
        id: entite.id,
        utilisateurId: entite.utilisateurId,
        nomUtilisateur: entite.nomUtilisateur,
        nom: entite.nom,
        email: entite.email,
        statut: entite.statut as TypeStatutAdmin,
        entrepriseId: entite.entrepriseId || null,
        modeAbonnement: entite.modeAbonnement as TypeModeAbonnementAdmin,
        montantMensuelAbonnement: entite.montantMensuelAbonnement,
        montantAnnuelAbonnement: entite.montantAnnuelAbonnement,
        autoriserMontantPersonnalise: entite.autoriserMontantPersonnalise,
        notifyClientsOverdue: entite.notifierClientsRetard,
        notifyAdminOverdue: entite.notifierAdminRetard,
        permissionTableauDeBord: entite.permissions.tableauDeBord,
        permissionClients: entite.permissions.clients,
        permissionLocations: entite.permissions.locations,
        permissionPaiements: entite.permissions.paiements,
        permissionDocuments: entite.permissions.documents,
        permissionParametres: entite.permissions.parametres,
        permissionTravaux: entite.permissions.travaux,
        permissionImports: entite.permissions.imports,
        permissionNotifications: entite.permissions.notifications,
        permissionExportPdf: entite.permissions.exportPdf,
      },
      update: {
        utilisateurId: entite.utilisateurId,
        nomUtilisateur: entite.nomUtilisateur,
        nom: entite.nom,
        email: entite.email,
        statut: entite.statut as TypeStatutAdmin,
        entrepriseId: entite.entrepriseId || null,
        modeAbonnement: entite.modeAbonnement as TypeModeAbonnementAdmin,
        montantMensuelAbonnement: entite.montantMensuelAbonnement,
        montantAnnuelAbonnement: entite.montantAnnuelAbonnement,
        autoriserMontantPersonnalise: entite.autoriserMontantPersonnalise,
        notifyClientsOverdue: entite.notifierClientsRetard,
        notifyAdminOverdue: entite.notifierAdminRetard,
        permissionTableauDeBord: entite.permissions.tableauDeBord,
        permissionClients: entite.permissions.clients,
        permissionLocations: entite.permissions.locations,
        permissionPaiements: entite.permissions.paiements,
        permissionDocuments: entite.permissions.documents,
        permissionParametres: entite.permissions.parametres,
        permissionTravaux: entite.permissions.travaux,
        permissionImports: entite.permissions.imports,
        permissionNotifications: entite.permissions.notifications,
        permissionExportPdf: entite.permissions.exportPdf,
      },
    })

    await this.synchroniserPermissionsUtilisateur(entite)
    return this.mapperVersEntite(element)
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.admin.delete({
      where: { id: String(id || '').trim() },
    })
  }

  private mapperVersEntite(element: {
    id: string
    utilisateurId: string
    nomUtilisateur: string
    nom: string
    email: string
    statut: TypeStatutAdmin
    entrepriseId: string | null
    modeAbonnement: TypeModeAbonnementAdmin
    montantMensuelAbonnement: number
    montantAnnuelAbonnement: number
    autoriserMontantPersonnalise: boolean
    permissionTableauDeBord: boolean
    permissionClients: boolean
    permissionLocations: boolean
    permissionPaiements: boolean
    permissionDocuments: boolean
    permissionParametres: boolean
    permissionTravaux: boolean
    permissionImports: boolean
    permissionNotifications: boolean
    permissionExportPdf: boolean
    notifyClientsOverdue: boolean
    notifyAdminOverdue: boolean
    creeLe: Date
  }): EntiteAdmin {
    const permissions = new BuilderEntitePermissionsAdmin()
      .avecTableauDeBord(element.permissionTableauDeBord)
      .avecClients(element.permissionClients)
      .avecLocations(element.permissionLocations)
      .avecPaiements(element.permissionPaiements)
      .avecDocuments(element.permissionDocuments)
      .avecParametres(element.permissionParametres)
      .avecTravaux(element.permissionTravaux)
      .avecImports(element.permissionImports)
      .avecNotifications(element.permissionNotifications)
      .avecExportPdf(element.permissionExportPdf)
      .construire()

    const builder = new BuilderEntiteAdmin()
      .avecId(element.id)
      .avecUtilisateurId(element.utilisateurId)
      .avecNomUtilisateur(element.nomUtilisateur)
      .avecNom(element.nom)
      .avecEmail(element.email)
      .avecStatut(element.statut)
      .avecModeAbonnement(element.modeAbonnement)
      .avecMontantMensuelAbonnement(element.montantMensuelAbonnement)
      .avecMontantAnnuelAbonnement(element.montantAnnuelAbonnement)
      .avecAutoriserMontantPersonnalise(element.autoriserMontantPersonnalise)
      .avecNotifierClientsRetard(element.notifyClientsOverdue)
      .avecNotifierAdminRetard(element.notifyAdminOverdue)
      .avecPermissions(permissions)
      .avecDateCreation(element.creeLe)

    if (element.entrepriseId) {
      builder.avecEntrepriseId(element.entrepriseId)
    }

    return builder.construire()
  }

  private async synchroniserPermissionsUtilisateur(entite: EntiteAdmin): Promise<void> {
    const utilisateurId = String(entite.utilisateurId || '').trim()
    if (!utilisateurId) return

    const utilisateurExiste = await this.prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: { id: true },
    })
    if (!utilisateurExiste) return

    const permissions = [
      { code: CODES_PERMISSIONS_ADMIN.DASHBOARD, autorise: entite.permissions.tableauDeBord },
      { code: CODES_PERMISSIONS_ADMIN.CLIENTS, autorise: entite.permissions.clients },
      { code: CODES_PERMISSIONS_ADMIN.LOCATIONS, autorise: entite.permissions.locations },
      { code: CODES_PERMISSIONS_ADMIN.PAIEMENTS, autorise: entite.permissions.paiements },
      { code: CODES_PERMISSIONS_ADMIN.DOCUMENTS, autorise: entite.permissions.documents },
      { code: CODES_PERMISSIONS_ADMIN.PARAMETRES, autorise: entite.permissions.parametres },
      { code: CODES_PERMISSIONS_ADMIN.TRAVAUX, autorise: entite.permissions.travaux },
      { code: CODES_PERMISSIONS_ADMIN.IMPORTS, autorise: entite.permissions.imports },
      { code: CODES_PERMISSIONS_ADMIN.NOTIFICATIONS, autorise: entite.permissions.notifications },
      { code: CODES_PERMISSIONS_ADMIN.PDF_EXPORT, autorise: entite.permissions.exportPdf },
    ]

    await this.prisma.$transaction(
      permissions.map((permission) =>
        this.prisma.permissionUtilisateur.upsert({
          where: {
            utilisateurId_code: {
              utilisateurId,
              code: permission.code,
            },
          },
          create: {
            utilisateurId,
            code: permission.code,
            autorise: permission.autorise,
          },
          update: {
            autorise: permission.autorise,
          },
        })
      )
    )
  }
}
