import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { lirePolitiquePlateforme } from '@/src/infrastructure/http/politiquePlateforme'

export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const contexteSession =
      await conteneurDependances.serviceAuthentification.obtenirContexteDepuisJetonAcces(jetonAcces)
    const role = String(contexteSession.utilisateur.role || '').toUpperCase()

    if (role !== 'SUPER_ADMIN') {
      throw new ErreurHttp(CODE_HTTP.INTERDIT, t(ERRORS.AUTH_PERMISSION_MANQUANTE))
    }

    await conteneurDependances.serviceAuthentification.exigerSecondeAuthSuperAdmin(jetonAcces)
    const politique = await lirePolitiquePlateforme(conteneurDependances.prisma)
    const audit = politique.auditCompliance
    const webhookUrl = String(audit.alertWebhookUrl || '').trim()
    const enabled = Boolean(audit.alertWebhookEnabled)
    const configured = webhookUrl.length > 0

    if (!enabled || !configured) {
      return conteneurDependances.reponseHttp.succes({
        ok: true,
        sent: false,
        enabled,
        configured,
        status: null,
      })
    }

    const payload = {
      source: 'kya-next-backend',
      type: 'security',
      test: true,
      sentAt: new Date().toISOString(),
      channels: politique.notifications.channels,
      message: 'Test webhook initie depuis les parametres Super Admin',
      payload: {
        event: 'manual_test',
        actor: contexteSession.utilisateur.id,
        role,
        message: 'Test webhook initie depuis les parametres Super Admin',
      },
    }

    let sent = false
    let status: number | null = null

    try {
      const reponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(audit.alertWebhookSecret
            ? { 'x-kya-webhook-secret': String(audit.alertWebhookSecret || '').trim() }
            : {}),
        },
        body: JSON.stringify(payload),
      })
      sent = reponse.ok
      status = reponse.status
    } catch {
      sent = false
      status = null
    }

    return conteneurDependances.reponseHttp.succes({
      ok: true,
      sent,
      enabled,
      configured,
      status,
    })
  }
)
