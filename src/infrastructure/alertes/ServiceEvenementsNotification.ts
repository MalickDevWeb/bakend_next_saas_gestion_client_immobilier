import type {
  TypeDestinataireNotification,
  TypeRoleDestinataireNotification,
} from '@/src/coeur/interfaces/InterfaceNotification'

export type TypeCodeEvenementNotification =
  | 'ADMIN_REQUEST_CREATED'
  | 'ADMIN_REQUEST_APPROVED'
  | 'ADMIN_CREATED'
  | 'ADMIN_UPDATED'
  | 'ADMIN_SUBSCRIPTION_PAYMENT_RECORDED'
  | 'CLIENT_PAYMENT_OVERDUE'
  | (string & {})

export type TypeSeveriteEvenementNotification = 'info' | 'warning' | 'critical'

export type TypeEvenementNotification = {
  code: TypeCodeEvenementNotification
  titre: string
  message: string
  severite: TypeSeveriteEvenementNotification
  rolesDestinataires: TypeRoleDestinataireNotification[]
  details?: Record<string, unknown>
  tags?: string[]
  destinataires?: Partial<Record<TypeRoleDestinataireNotification, TypeDestinataireNotification[]>>
}

export type TypeEcouteurEvenementNotification = (
  evenement: TypeEvenementNotification
) => Promise<void> | void

export class ServiceEvenementsNotification {
  private readonly ecouteursParCode = new Map<string, Set<TypeEcouteurEvenementNotification>>()
  private readonly ecouteursGlobaux = new Set<TypeEcouteurEvenementNotification>()

  public ecouter(codeEvenement: TypeCodeEvenementNotification, ecouteur: TypeEcouteurEvenementNotification): () => void {
    const code = String(codeEvenement || '').trim()
    if (!code) return () => undefined

    const ecouteurs = this.ecouteursParCode.get(code) || new Set<TypeEcouteurEvenementNotification>()
    ecouteurs.add(ecouteur)
    this.ecouteursParCode.set(code, ecouteurs)

    return () => {
      const existants = this.ecouteursParCode.get(code)
      if (!existants) return
      existants.delete(ecouteur)
      if (!existants.size) this.ecouteursParCode.delete(code)
    }
  }

  public ecouterTous(ecouteur: TypeEcouteurEvenementNotification): () => void {
    this.ecouteursGlobaux.add(ecouteur)
    return () => {
      this.ecouteursGlobaux.delete(ecouteur)
    }
  }

  public async publier(evenement: TypeEvenementNotification): Promise<void> {
    const code = String(evenement.code || '').trim()
    if (!code) return
    const ecouteursSpecifiques = this.ecouteursParCode.get(code) || new Set<TypeEcouteurEvenementNotification>()
    const ecouteurs = new Set<TypeEcouteurEvenementNotification>([
      ...this.ecouteursGlobaux,
      ...ecouteursSpecifiques,
    ])
    if (!ecouteurs.size) return

    await Promise.allSettled(
      Array.from(ecouteurs.values()).map(async (ecouteur) => {
        try {
          await ecouteur(evenement)
        } catch {
          // Listener best-effort: une erreur locale ne doit pas stopper les autres envois.
        }
      })
    )
  }
}
