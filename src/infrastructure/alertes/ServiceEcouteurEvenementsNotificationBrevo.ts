import type {
  InterfaceNotification,
  TypeDestinataireNotification,
  TypeRoleDestinataireNotification,
} from '@/src/coeur/interfaces/InterfaceNotification'
import type { TypeEvenementNotification } from '@/src/infrastructure/alertes/ServiceEvenementsNotification'

type TypeOptionsServiceEcouteurEvenementsNotificationBrevo = {
  serviceNotification: InterfaceNotification
  destinatairesParRole: Partial<Record<TypeRoleDestinataireNotification, TypeDestinataireNotification[]>>
  daoAdmin?: { rechercherParId: (id: string) => Promise<{ id: string; statut: string; notifyClientsRetard?: boolean; notifyAdminRetard?: boolean } | null> }
}

export class ServiceEcouteurEvenementsNotificationBrevo {
  constructor(private readonly options: TypeOptionsServiceEcouteurEvenementsNotificationBrevo) {}

  public async gerer(evenement: TypeEvenementNotification): Promise<void> {
    if (!this.options.serviceNotification.estConfigure()) {
      console.warn('[Brevo][skip] Service non configure', { evenement: evenement.code })
      return
    }

    const destinataires = await this.resoudreDestinataires(evenement)
    if (!destinataires.length) {
      console.warn('[Brevo][skip] Aucun destinataire resolu', {
        evenement: evenement.code,
        roles: evenement.rolesDestinataires || [],
      })
      return
    }

    await this.options.serviceNotification.notifier({
      evenement: evenement.code,
      sujet: evenement.titre,
      message: evenement.message,
      details: evenement.details,
      tags: evenement.tags,
      destinataires,
    })
  }

  private async resoudreDestinataires(
    evenement: TypeEvenementNotification
  ): Promise<TypeDestinataireNotification[]> {
    const uniques = new Map<string, TypeDestinataireNotification>()
    const destinationsEvenement = evenement.destinataires || {}
    const filtreRetard = await this.resoudreFiltreRetardPaiement(evenement)

    for (const role of evenement.rolesDestinataires || []) {
      for (const destinataire of this.options.destinatairesParRole[role] || []) {
        this.ajouterDestinataireUnique(uniques, {
          email: destinataire.email,
          nom: destinataire.nom,
          role,
        })
      }

      for (const destinataire of destinationsEvenement[role] || []) {
        this.ajouterDestinataireUnique(uniques, {
          email: destinataire.email,
          nom: destinataire.nom,
          role: destinataire.role || role,
        })
      }
    }

    let resultat = Array.from(uniques.values())
    if (filtreRetard) {
      resultat = resultat.filter((dest) => {
        const role = String(dest.role || '').toUpperCase()
        if (role === 'CLIENT') return filtreRetard.allowClient
        if (role === 'ADMIN') return filtreRetard.allowAdmin
        if (role === 'SUPER_ADMIN') return filtreRetard.allowSuperAdmin
        return true
      })
    }

    return resultat
  }

  private ajouterDestinataireUnique(
    uniques: Map<string, TypeDestinataireNotification>,
    destinataire: TypeDestinataireNotification
  ): void {
    const email = this.normaliserEmail(destinataire.email)
    if (!email) return
    const cle = email.toLowerCase()
    const nom = this.normaliserTexte(destinataire.nom)
    uniques.set(cle, {
      email,
      ...(nom ? { nom } : {}),
      ...(destinataire.role ? { role: destinataire.role } : {}),
    })
  }

  private normaliserEmail(valeur: unknown): string | null {
    const email = String(valeur || '').trim()
    if (!email) return null
    const formatValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    return formatValide ? email : null
  }

  private normaliserTexte(valeur: unknown): string {
    return String(valeur || '').trim()
  }

  private async resoudreFiltreRetardPaiement(evenement: TypeEvenementNotification): Promise<{
    allowClient: boolean
    allowAdmin: boolean
    allowSuperAdmin: boolean
  } | null> {
    if (String(evenement.code || '').toUpperCase() !== 'CLIENT_PAYMENT_OVERDUE') return null
    const adminId =
      String(
        (evenement.details as Record<string, unknown> | undefined)?.adminId ||
          (evenement.details as Record<string, unknown> | undefined)?.admin_id ||
          ''
      ).trim() || null

    if (!adminId || !this.options.daoAdmin) {
      return { allowClient: false, allowAdmin: false, allowSuperAdmin: true }
    }

    try {
      const admin = await this.options.daoAdmin.rechercherParId(adminId)
      if (!admin) return { allowClient: false, allowAdmin: false, allowSuperAdmin: true }
      const actif = String(admin.statut || '').toUpperCase() === 'ACTIF'
      const allowClient = Boolean(admin.notifyClientsRetard) && actif
      const allowAdmin = Boolean(admin.notifyAdminRetard) && actif
      return {
        allowClient,
        allowAdmin,
        allowSuperAdmin: true,
      }
    } catch {
      return { allowClient: false, allowAdmin: false, allowSuperAdmin: true }
    }
  }
}
