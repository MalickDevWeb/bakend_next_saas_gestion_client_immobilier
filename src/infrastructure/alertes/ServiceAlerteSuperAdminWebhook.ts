type TypeSeveriteAlerteSuperAdmin = 'info' | 'warning' | 'critical'
type TypeActeurCibleAlerte = 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT'

export type TypeEntreeAlerteSuperAdminWebhook = {
  eventType: string
  titre: string
  severite: TypeSeveriteAlerteSuperAdmin
  acteurCible?: TypeActeurCibleAlerte
  details?: Record<string, unknown>
}

export class ServiceAlerteSuperAdminWebhook {
  constructor(private readonly urlWebhook: string) {}

  public estConfigure(): boolean {
    return Boolean(String(this.urlWebhook || '').trim())
  }

  public async envoyer(entree: TypeEntreeAlerteSuperAdminWebhook): Promise<boolean> {
    const url = String(this.urlWebhook || '').trim()
    if (!url) return false

    const charge = {
      acteurCible: entree.acteurCible || 'SUPER_ADMIN',
      eventType: String(entree.eventType || '').trim() || 'SUPER_ADMIN_EVENT',
      titre: String(entree.titre || '').trim() || 'Alerte super admin',
      severite: entree.severite,
      source: 'next-backend',
      horodatage: new Date().toISOString(),
      details: entree.details || {},
      ...(entree.details || {}),
    }

    try {
      const reponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(charge),
      })
      return reponse.ok
    } catch {
      return false
    }
  }
}
