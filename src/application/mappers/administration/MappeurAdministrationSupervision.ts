import {
  EntiteAdmin,
  EntiteDemandeAdmin,
  EntiteEntreprise,
  EntitePermissionsAdmin,
} from '@/src/domaine/entites/administration'
import { EntiteUtilisateur } from '@/src/domaine/entites/utilisateurs/EntiteUtilisateur'

export class MappeurAdministrationSupervision {
  public mapperAdminEnDto(admin: EntiteAdmin): Record<string, unknown> {
    return {
      id: admin.id,
      userId: admin.utilisateurId,
      username: admin.nomUtilisateur,
      name: admin.nom,
      email: admin.email,
      status: admin.statut,
      entrepriseId: admin.entrepriseId,
      createdAt: admin.creeLe.toISOString(),
      subscriptionMode: admin.modeAbonnement,
      subscriptionMonthlyAmount: admin.montantMensuelAbonnement,
      subscriptionAnnualAmount: admin.montantAnnuelAbonnement,
      subscriptionAllowCustomAmount: admin.autoriserMontantPersonnalise,
      permissions: this.mapperPermissionsAdmin(admin.permissions),
    }
  }

  public mapperDemandeAdminEnDto(demande: EntiteDemandeAdmin): Record<string, unknown> {
    return {
      id: demande.id,
      name: demande.nom,
      email: demande.email,
      phone: demande.telephone,
      entrepriseName: demande.nomEntreprise,
      status: demande.statut,
      username: demande.nomUtilisateur,
      password: demande.motDePasse,
      paid: demande.paye,
      paidAt: demande.payeLe ? demande.payeLe.toISOString() : undefined,
      createdAt: demande.creeLe.toISOString(),
    }
  }

  public mapperEntrepriseEnDto(entreprise: EntiteEntreprise): Record<string, unknown> {
    return {
      id: entreprise.id,
      name: entreprise.nom,
      adminId: entreprise.adminId,
      createdAt: entreprise.creeLe.toISOString(),
    }
  }

  public mapperUtilisateurEnDto(utilisateur: EntiteUtilisateur): Record<string, unknown> {
    return {
      id: utilisateur.id,
      username: utilisateur.identifiantConnexion,
      name: utilisateur.nomComplet,
      email: utilisateur.email.valeur,
      role: utilisateur.role,
      status: utilisateur.statut,
      phone: utilisateur.telephone,
    }
  }

  private mapperPermissionsAdmin(permissions: EntitePermissionsAdmin): Record<string, boolean> {
    return {
      dashboard: permissions.tableauDeBord,
      clients: permissions.clients,
      rentals: permissions.locations,
      payments: permissions.paiements,
      documents: permissions.documents,
      settings: permissions.parametres,
      work: permissions.travaux,
      imports: permissions.imports,
      notifications: permissions.notifications,
      pdfExport: permissions.exportPdf,
    }
  }
}
