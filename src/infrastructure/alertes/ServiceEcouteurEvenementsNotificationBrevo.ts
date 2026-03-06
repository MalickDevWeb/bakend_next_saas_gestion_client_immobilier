import type {
  InterfaceNotification,
  TypeDestinataireNotification,
  TypeRoleDestinataireNotification,
} from '@/src/coeur/interfaces/InterfaceNotification'
import type { TypeEvenementNotification } from '@/src/infrastructure/alertes/ServiceEvenementsNotification'

type TypeOptionsServiceEcouteurEvenementsNotificationBrevo = {
  serviceNotification: InterfaceNotification
  destinatairesParRole: Partial<Record<TypeRoleDestinataireNotification, TypeDestinataireNotification[]>>
}

export class ServiceEcouteurEvenementsNotificationBrevo {
  constructor(private readonly options: TypeOptionsServiceEcouteurEvenementsNotificationBrevo) {}

  public async gerer(evenement: TypeEvenementNotification): Promise<void> {
    if (!this.options.serviceNotification.estConfigure()) return

    const destinataires = this.resoudreDestinataires(evenement)
    if (!destinataires.length) return

    await this.options.serviceNotification.notifier({
      evenement: evenement.code,
      sujet: evenement.titre,
      message: evenement.message,
      details: evenement.details,
      tags: evenement.tags,
      destinataires,
    })
  }

  private resoudreDestinataires(evenement: TypeEvenementNotification): TypeDestinataireNotification[] {
    const uniques = new Map<string, TypeDestinataireNotification>()
    const destinationsEvenement = evenement.destinataires || {}

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

    return Array.from(uniques.values())
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
}
