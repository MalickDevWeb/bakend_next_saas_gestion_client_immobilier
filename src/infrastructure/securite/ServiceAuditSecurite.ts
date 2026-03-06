import { PrismaClient } from '@prisma/client'
import {
  InterfaceServiceAuditSecurite,
  TypeEntreeAuditSecurite,
} from '@/src/coeur/interfaces/InterfaceServiceAuditSecurite'
import { ServiceAlerteSuperAdminWebhook } from '@/src/infrastructure/alertes/ServiceAlerteSuperAdminWebhook'
import {
  envoyerAlerteConformiteDepuisPolitique,
  lirePolitiquePlateforme,
} from '@/src/infrastructure/http/politiquePlateforme'

type TypeConfigurationWhatsAppAlerte = {
  apiToken: string
  phoneNumberId: string
  destination: string
  apiVersion: string
}

export class ServiceAuditSecurite implements InterfaceServiceAuditSecurite {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly urlWebhookAlertes: string,
    private readonly configurationWhatsAppAlerte?: TypeConfigurationWhatsAppAlerte,
    private readonly serviceAlerteSuperAdminWebhook?: ServiceAlerteSuperAdminWebhook
  ) {}

  private mapperEvenementConformite(action: string): 'login_failure' | null {
    if (action === 'AUTH_LOGIN_FAILED' || action === 'AUTH_LOCKED') {
      return 'login_failure'
    }
    return null
  }

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

    const evenementConformite = this.mapperEvenementConformite(String(entree.action || '').trim())
    if (evenementConformite) {
      void envoyerAlerteConformiteDepuisPolitique({
        prisma: this.prisma,
        type: 'security',
        evenement: evenementConformite,
        payload: {
          username: entree.utilisateurId || 'unknown',
          action: entree.action,
          status: entree.statut,
          details: entree.details || '',
          ip: entree.adresseIp || null,
        },
      })
    }

    const actionCritique = ['AUTH_REFRESH_REUSE_DETECTED', 'AUTH_LOCKED'].includes(entree.action)
    if (!actionCritique) return

    let canalWhatsAppActif = true
    try {
      const politique = await lirePolitiquePlateforme(this.prisma)
      if (!politique.auditCompliance.alertOnSecurityEvent) {
        return
      }
      canalWhatsAppActif = Boolean(politique.notifications.channels.whatsapp)
    } catch {
      // fallback vers comportement historique
    }

    const chargeAlerte = {
      acteurCible: 'SUPER_ADMIN',
      eventType: 'SUPER_ADMIN_SECURITY_CRITICAL',
      titre: 'Alerte securite critique',
      severite: 'critical',
      source: 'next-backend',
      action: entree.action,
      statut: entree.statut,
      details: entree.details || '',
      utilisateurId: entree.utilisateurId || null,
      adresseIp: entree.adresseIp || null,
      horodatage: new Date().toISOString(),
    }

    if (this.serviceAlerteSuperAdminWebhook?.estConfigure()) {
      await this.serviceAlerteSuperAdminWebhook.envoyer({
        eventType: 'SUPER_ADMIN_SECURITY_CRITICAL',
        titre: 'Alerte securite critique',
        severite: 'critical',
        details: {
          action: chargeAlerte.action,
          statut: chargeAlerte.statut,
          details: chargeAlerte.details,
          utilisateurId: chargeAlerte.utilisateurId,
          adresseIp: chargeAlerte.adresseIp,
        },
      })
    } else if (this.urlWebhookAlertes) {
      try {
        await fetch(this.urlWebhookAlertes, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chargeAlerte),
        })
      } catch {
        // best effort: l'audit base reste la source fiable
      }
    }

    const conf = this.configurationWhatsAppAlerte
    if (!canalWhatsAppActif) return
    if (!conf) return
    if (!conf.apiToken || !conf.phoneNumberId || !conf.destination) return

    const destination = this.normaliserDestinationWhatsApp(conf.destination)
    if (!destination) return

    const message = this.construireMessageWhatsApp(chargeAlerte)
    const url = `https://graph.facebook.com/${conf.apiVersion}/${conf.phoneNumberId}/messages`

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${conf.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: destination,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        }),
      })
    } catch {
      // best effort: l'audit base reste la source fiable
    }
  }

  private normaliserDestinationWhatsApp(valeur: string): string {
    return String(valeur || '').replace(/[^\d]/g, '')
  }

  private construireMessageWhatsApp(
    charge: {
      action: string
      statut: string
      details: string
      utilisateurId: string | null
      adresseIp: string | null
      horodatage: string
    }
  ): string {
    return [
      '[KYA ALERTE SECURITE]',
      `Action: ${charge.action}`,
      `Statut: ${charge.statut}`,
      `IP: ${charge.adresseIp || '-'}`,
      `Utilisateur: ${charge.utilisateurId || '-'}`,
      `Details: ${charge.details || '-'}`,
      `Date: ${charge.horodatage}`,
    ].join('\n')
  }
}
