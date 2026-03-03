import { PrismaClient } from '@prisma/client'
import {
  InterfaceServiceAuditSecurite,
  TypeEntreeAuditSecurite,
} from '@/src/coeur/interfaces/InterfaceServiceAuditSecurite'

export class ServiceAuditSecurite implements InterfaceServiceAuditSecurite {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly urlWebhookAlertes: string
  ) {}

  public async enregistrer(entree: TypeEntreeAuditSecurite): Promise<void> {
    await this.prisma.journalAudit.create({
      data: {
        utilisateurId: entree.utilisateurId || null,
        action: entree.action,
        statut: entree.statut,
        details: entree.details || null,
        adresseIp: entree.adresseIp || null,
        agentUtilisateur: entree.agentUtilisateur || null,
      },
    })

    if (!this.urlWebhookAlertes) return

    const actionCritique = ['AUTH_REFRESH_REUSE_DETECTED', 'AUTH_LOCKED'].includes(entree.action)
    if (!actionCritique) return

    try {
      await fetch(this.urlWebhookAlertes, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: entree.action,
          statut: entree.statut,
          details: entree.details || '',
          utilisateurId: entree.utilisateurId || null,
          adresseIp: entree.adresseIp || null,
          horodatage: new Date().toISOString(),
        }),
      })
    } catch {
      // best effort: l'audit base reste la source fiable
    }
  }
}
