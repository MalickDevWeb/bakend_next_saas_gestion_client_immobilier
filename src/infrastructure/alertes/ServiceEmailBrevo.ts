import type {
  InterfaceNotification,
  TypeDestinataireNotification,
  TypeEntreeNotification,
} from '@/src/coeur/interfaces/InterfaceNotification'

type TypeDestinataireEmailBrevo = {
  email: string
  name?: string
}

type TypeEntreeEnvoiEmailBrevo = {
  destinataires: TypeDestinataireEmailBrevo[]
  sujet: string
  contenuTexte: string
  contenuHtml?: string
  tags?: string[]
}

type TypeOptionsServiceEmailBrevo = {
  cleApi: string
  expediteurEmail: string
  expediteurNom?: string
  destinatairesParDefaut?: string[]
  templates?: Record<string, number | null>
}

type TypeLigneSectionNotification = {
  label: string
  valeur: string
}

type TypeSectionNotification = {
  titre: string
  lignes: TypeLigneSectionNotification[]
}

type TypeContenuNotification = {
  contenuTexte: string
  contenuHtml: string
}

export class ServiceEmailBrevo implements InterfaceNotification {
  private static readonly URL_BREVO = 'https://api.brevo.com/v3/smtp/email'

  constructor(private readonly options: TypeOptionsServiceEmailBrevo) {}

  public estConfigure(): boolean {
    return Boolean(this.options.cleApi && this.options.expediteurEmail)
  }

  public async notifier(entree: TypeEntreeNotification): Promise<boolean> {
    const details = this.versObjet(entree.details) || {}
    const destinataires = (entree.destinataires || [])
      .map((item) => this.mapperDestinataireNotification(item))
      .filter((item): item is TypeDestinataireEmailBrevo => Boolean(item))
    if (!destinataires.length) return false

    const contenu = this.construireContenuParEvenement(entree, details)
    return this.envoyer({
      destinataires,
      sujet: this.normaliserTexte(entree.sujet) || 'Notification KYA',
      contenuTexte: contenu.contenuTexte,
      contenuHtml: contenu.contenuHtml,
      tags: entree.tags || [],
    })
  }

  public async envoyerDemandeAdminCreee(donnees: Record<string, unknown>): Promise<boolean> {
    const destinataires = this.extraireDestinataires(donnees)
    if (!destinataires.length) return false
    return this.notifier({
      evenement: 'ADMIN_REQUEST_CREATED',
      sujet: 'Nouvelle demande administrateur a valider',
      message: 'Une nouvelle demande administrateur a ete soumise.',
      details: donnees,
      tags: ['kya', 'admin-request', 'created'],
      destinataires: destinataires.map((item) => ({
        email: item.email,
        nom: item.name,
      })),
    })
  }

  public async envoyerDemandeAdminApprouvee(donnees: Record<string, unknown>): Promise<boolean> {
    const destinataires = this.extraireDestinataires(donnees)
    if (!destinataires.length) return false
    return this.notifier({
      evenement: 'ADMIN_REQUEST_APPROVED',
      sujet: 'Demande administrateur approuvee',
      message: 'Votre demande administrateur a ete approuvee.',
      details: donnees,
      tags: ['kya', 'admin-request', 'approved'],
      destinataires: destinataires.map((item) => ({
        email: item.email,
        nom: item.name,
      })),
    })
  }

  public extraireDestinataires(donnees: Record<string, unknown>): TypeDestinataireEmailBrevo[] {
    const uniques = new Map<string, TypeDestinataireEmailBrevo>()

    for (const brut of this.options.destinatairesParDefaut || []) {
      const email = this.normaliserEmail(brut)
      if (!email) continue
      uniques.set(email.toLowerCase(), { email })
    }

    const details = this.versObjet(donnees.details)
    const emailDemande = this.normaliserEmail(donnees.email) || this.normaliserEmail(details?.email)
    const nomDemande = this.normaliserTexte(donnees.name) || this.normaliserTexte(details?.name)
    if (emailDemande) {
      const cle = emailDemande.toLowerCase()
      uniques.set(cle, {
        email: emailDemande,
        ...(nomDemande ? { name: nomDemande } : {}),
      })
    }

    return Array.from(uniques.values())
  }

  public async envoyer(entree: TypeEntreeEnvoiEmailBrevo): Promise<boolean> {
    if (!this.estConfigure()) return false

    const destinataires = (entree.destinataires || [])
      .map((item) => ({
        email: this.normaliserEmail(item.email),
        name: this.normaliserTexte(item.name),
      }))
      .filter((item): item is { email: string | null; name: string } => Boolean(item.email))
      .map((item) => ({
        email: item.email as string,
        ...(item.name ? { name: item.name } : {}),
      }))
    if (!destinataires.length) return false

    const templateId = this.resoudreTemplateId(entree)

    const charge: Record<string, unknown> = {
      sender: {
        email: this.options.expediteurEmail,
        name: this.options.expediteurNom || 'Keur Ya Aicha',
      },
      to: destinataires,
      subject: entree.sujet,
      tags: entree.tags || [],
    }

    if (templateId) {
      charge.templateId = templateId
      charge.params = this.construireParamsTemplate(entree)
    } else {
      charge.textContent = entree.contenuTexte
      charge.htmlContent = entree.contenuHtml || undefined
    }

    try {
      const reponse = await fetch(ServiceEmailBrevo.URL_BREVO, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.options.cleApi,
        },
        body: JSON.stringify(charge),
      })
      if (!reponse.ok) {
        const details = await reponse.text().catch(() => '')
        console.error('[Brevo] Envoi email refuse', {
          statut: reponse.status,
          details: details.slice(0, 500),
        })
        return false
      }
      return true
    } catch {
      console.error('[Brevo] Echec technique pendant l envoi email')
      return false
    }
  }

  private resoudreTemplateId(entree: TypeEntreeEnvoiEmailBrevo): number | null {
    const map = this.options.templates || {}
    const evenement = this.normaliserTexte((entree as unknown as TypeEntreeNotification).evenement || '')
    const code = evenement ? evenement.toUpperCase() : ''
    const candidates = [code, 'GENERIC']
    for (const cle of candidates) {
      const valeur = map[cle]
      if (typeof valeur === 'number' && valeur > 0) return valeur
    }
    return null
  }

  private construireParamsTemplate(entree: TypeEntreeEnvoiEmailBrevo): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      sujet: entree.sujet,
      message: entree.contenuTexte,
    }

    if ((entree as unknown as TypeEntreeNotification).details) {
      payload.details = this.versObjet((entree as unknown as TypeEntreeNotification).details)
    }

    if ((entree as unknown as TypeEntreeNotification).evenement) {
      payload.evenement = (entree as unknown as TypeEntreeNotification).evenement
    }

    return payload
  }

  private construireContenuParEvenement(
    entree: TypeEntreeNotification,
    details: Record<string, unknown>
  ): TypeContenuNotification {
    const evenement = this.normaliserTexte(entree.evenement).toUpperCase()

    if (evenement === 'CLIENT_PAYMENT_OVERDUE') {
      return this.construireContenuClientPaiementEnRetard(entree, details)
    }
    if (evenement === 'ADMIN_SUBSCRIPTION_PAYMENT_RECORDED') {
      return this.construireContenuPaiementAbonnementAdmin(entree, details)
    }
    if (evenement === 'ADMIN_REQUEST_CREATED') {
      return this.construireContenuDemandeAdminCreee(entree, details)
    }
    if (evenement === 'ADMIN_REQUEST_APPROVED') {
      return this.construireContenuDemandeAdminApprouvee(entree, details)
    }

    return this.construireContenuGenerique(entree, details)
  }

  private construireContenuClientPaiementEnRetard(
    entree: TypeEntreeNotification,
    details: Record<string, unknown>
  ): TypeContenuNotification {
    const appName = this.resoudreAppName(details)
    const logoUrl = this.normaliserLogoPublique(details.logoUrl)
    const sections: TypeSectionNotification[] = [
      {
        titre: 'Client',
        lignes: [
          { label: 'Nom', valeur: this.lireTexte(details, ['clientName', 'name']) || '-' },
          { label: 'Email', valeur: this.lireTexte(details, ['clientEmail', 'email']) || '-' },
          { label: 'Telephone', valeur: this.lireTexte(details, ['clientPhone', 'phone']) || '-' },
        ],
      },
      {
        titre: 'Paiement en retard',
        lignes: [
          { label: 'Bien', valeur: this.lireTexte(details, ['propertyName']) || '-' },
          { label: 'Date echeance', valeur: this.formaterDate(this.lireTexte(details, ['dueDate', 'dateEcheance'])) },
          { label: 'Jours retard', valeur: this.lireTexte(details, ['daysLate', 'joursRetard']) || '-' },
          { label: 'Montant du', valeur: this.formaterMontant(this.lireNombre(details, ['amountDue', 'montantDu'])) },
          { label: 'Montant paye', valeur: this.formaterMontant(this.lireNombre(details, ['amountPaid', 'montantPaye'])) },
          {
            label: 'Montant restant',
            valeur: this.formaterMontant(
              this.lireNombre(details, ['amountRemaining', 'montantRestant'])
            ),
          },
          { label: 'Reference paiement', valeur: this.lireTexte(details, ['paiementId', 'paymentId']) || '-' },
        ],
      },
      {
        titre: 'Administration',
        lignes: [
          { label: 'Admin', valeur: this.lireTexte(details, ['adminName']) || '-' },
          { label: 'Entreprise', valeur: this.lireTexte(details, ['companyName']) || '-' },
          { label: 'Contact admin', valeur: this.lireTexte(details, ['adminEmail']) || '-' },
        ],
      },
    ]

    return this.construireContenuStructure({
      appName,
      logoUrl,
      evenement: 'Retard de paiement',
      accent: '#B45309',
      accroche:
        this.normaliserTexte(entree.message) ||
        'Un retard de paiement a ete detecte. Merci de regulariser votre situation rapidement.',
      sections,
    })
  }

  private construireContenuPaiementAbonnementAdmin(
    entree: TypeEntreeNotification,
    details: Record<string, unknown>
  ): TypeContenuNotification {
    const appName = this.resoudreAppName(details)
    const logoUrl = this.normaliserLogoPublique(details.logoUrl)
    const sections: TypeSectionNotification[] = [
      {
        titre: 'Admin concerne',
        lignes: [
          { label: 'Nom', valeur: this.lireTexte(details, ['adminName']) || '-' },
          { label: 'Email', valeur: this.lireTexte(details, ['adminEmail']) || '-' },
          { label: 'Entreprise', valeur: this.lireTexte(details, ['companyName']) || '-' },
          { label: 'Admin ID', valeur: this.lireTexte(details, ['adminId']) || '-' },
        ],
      },
      {
        titre: 'Transaction abonnement',
        lignes: [
          { label: 'Montant', valeur: this.formaterMontant(this.lireNombre(details, ['amount'])) },
          { label: 'Mois', valeur: this.lireTexte(details, ['month']) || '-' },
          { label: 'Mode abonnement', valeur: this.lireTexte(details, ['subscriptionMode']) || '-' },
          { label: 'Methode', valeur: this.lireTexte(details, ['method']) || '-' },
          { label: 'Statut', valeur: this.lireTexte(details, ['status']) || '-' },
          { label: 'Fournisseur', valeur: this.lireTexte(details, ['provider']) || '-' },
          { label: 'Ref fournisseur', valeur: this.lireTexte(details, ['providerReference']) || '-' },
          { label: 'Ref transaction', valeur: this.lireTexte(details, ['transactionRef']) || '-' },
          { label: 'Telephone payeur', valeur: this.lireTexte(details, ['payerPhone']) || '-' },
          { label: 'Lien paiement', valeur: this.lireTexte(details, ['checkoutUrl']) || '-' },
          { label: 'Date paiement', valeur: this.formaterDate(this.lireTexte(details, ['paidAt'])) },
          { label: 'Date approbation', valeur: this.formaterDate(this.lireTexte(details, ['approvedAt'])) },
          { label: 'Approuve par', valeur: this.lireTexte(details, ['approvedBy']) || '-' },
        ],
      },
    ]

    return this.construireContenuStructure({
      appName,
      logoUrl,
      evenement: 'Paiement abonnement admin',
      accent: '#0F766E',
      accroche:
        this.normaliserTexte(entree.message) ||
        'Un paiement d abonnement admin a ete enregistre avec les details suivants.',
      sections,
    })
  }

  private construireContenuDemandeAdminCreee(
    entree: TypeEntreeNotification,
    details: Record<string, unknown>
  ): TypeContenuNotification {
    const appName = this.resoudreAppName(details)
    const logoUrl = this.normaliserLogoPublique(details.logoUrl)
    const sections: TypeSectionNotification[] = [
      {
        titre: 'Demande admin',
        lignes: [
          { label: 'Nom', valeur: this.lireTexte(details, ['name']) || '-' },
          { label: 'Email', valeur: this.lireTexte(details, ['email']) || '-' },
          { label: 'Telephone', valeur: this.lireTexte(details, ['phone']) || '-' },
          { label: 'Entreprise', valeur: this.lireTexte(details, ['entrepriseName', 'companyName']) || '-' },
          { label: 'Statut', valeur: this.lireTexte(details, ['status']) || '-' },
          { label: 'Date creation', valeur: this.formaterDate(this.lireTexte(details, ['createdAt'])) },
        ],
      },
    ]

    return this.construireContenuStructure({
      appName,
      logoUrl,
      evenement: 'Nouvelle demande admin',
      accent: '#1D4ED8',
      accroche:
        this.normaliserTexte(entree.message) ||
        'Une nouvelle demande administrateur est en attente de validation.',
      sections,
    })
  }

  private construireContenuDemandeAdminApprouvee(
    entree: TypeEntreeNotification,
    details: Record<string, unknown>
  ): TypeContenuNotification {
    const appName = this.resoudreAppName(details)
    const logoUrl = this.normaliserLogoPublique(details.logoUrl)
    const sections: TypeSectionNotification[] = [
      {
        titre: 'Validation de la demande',
        lignes: [
          { label: 'Nom', valeur: this.lireTexte(details, ['name']) || '-' },
          { label: 'Email', valeur: this.lireTexte(details, ['email']) || '-' },
          { label: 'Entreprise', valeur: this.lireTexte(details, ['entrepriseName', 'companyName']) || '-' },
          { label: 'Statut precedent', valeur: this.lireTexte(details, ['previousStatus']) || '-' },
          { label: 'Date approbation', valeur: this.formaterDate(this.lireTexte(details, ['approvedAt'])) },
          { label: 'Approuve par', valeur: this.lireTexte(details, ['approvedByUserId']) || '-' },
        ],
      },
    ]

    return this.construireContenuStructure({
      appName,
      logoUrl,
      evenement: 'Demande admin approuvee',
      accent: '#0F766E',
      accroche:
        this.normaliserTexte(entree.message) ||
        'Votre demande administrateur a ete approuvee.',
      sections,
    })
  }

  private construireContenuGenerique(
    entree: TypeEntreeNotification,
    details: Record<string, unknown>
  ): TypeContenuNotification {
    const appName = this.resoudreAppName(details)
    const logoUrl = this.normaliserLogoPublique(details.logoUrl)
    const lignes = Object.entries(details)
      .slice(0, 15)
      .map(([cle, valeur]) => ({ label: cle, valeur: this.formaterValeur(valeur) }))
    const sections: TypeSectionNotification[] = [
      {
        titre: 'Details',
        lignes: lignes.length ? lignes : [{ label: 'Information', valeur: '-' }],
      },
    ]

    return this.construireContenuStructure({
      appName,
      logoUrl,
      evenement: this.normaliserTexte(entree.evenement) || 'Notification',
      accent: '#334155',
      accroche: this.normaliserTexte(entree.message) || 'Nouvelle notification.',
      sections,
    })
  }

  private construireContenuStructure(entree: {
    appName: string
    logoUrl: string | null
    evenement: string
    accent: string
    accroche: string
    sections: TypeSectionNotification[]
  }): TypeContenuNotification {
    const contenuTexte = this.construireVersionTexte(entree)
    const contenuHtml = this.construireVersionHtml(entree)
    return { contenuTexte, contenuHtml }
  }

  private construireVersionTexte(entree: {
    appName: string
    evenement: string
    accroche: string
    sections: TypeSectionNotification[]
  }): string {
    const lignes: string[] = [
      `${entree.appName} - ${entree.evenement}`,
      '',
      entree.accroche,
      '',
    ]

    for (const section of entree.sections) {
      lignes.push(`${section.titre}:`)
      for (const ligne of section.lignes) {
        lignes.push(`- ${ligne.label}: ${ligne.valeur}`)
      }
      lignes.push('')
    }

    lignes.push('Merci,')
    lignes.push(entree.appName)
    return lignes.join('\n')
  }

  private construireVersionHtml(entree: {
    appName: string
    logoUrl: string | null
    evenement: string
    accent: string
    accroche: string
    sections: TypeSectionNotification[]
  }): string {
    const accent = this.normaliserTexte(entree.accent) || '#334155'
    const logoUrl = this.normaliserLogoPublique(entree.logoUrl)
    const initiale = this.echapperHtml((entree.appName.slice(0, 1) || 'K').toUpperCase())
    const enteteLogo = logoUrl
      ? `<img src="${this.echapperHtml(logoUrl)}" alt="Logo" style="width:48px;height:48px;border-radius:10px;object-fit:cover;border:1px solid #e2e8f0;" />`
      : `<div style="width:48px;height:48px;border-radius:10px;background:${accent};color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;">${initiale}</div>`

    const sectionsHtml = entree.sections
      .map((section) => {
        const lignes = section.lignes
          .map(
            (ligne) => `
              <tr>
                <td style="padding:8px 10px;color:#475569;font-size:13px;width:38%;vertical-align:top;">
                  ${this.echapperHtml(ligne.label)}
                </td>
                <td style="padding:8px 10px;color:#0f172a;font-size:13px;vertical-align:top;font-weight:600;">
                  ${this.echapperHtml(ligne.valeur)}
                </td>
              </tr>
            `
          )
          .join('')

        return `
          <section style="margin-top:14px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#ffffff;">
            <div style="background:#f8fafc;padding:10px 12px;font-size:13px;font-weight:700;color:#1e293b;">
              ${this.echapperHtml(section.titre)}
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tbody>
                ${lignes}
              </tbody>
            </table>
          </section>
        `
      })
      .join('')

    return `
      <div style="margin:0;padding:20px;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dbe7ff;border-radius:16px;overflow:hidden;">
          <div style="padding:16px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${enteteLogo}
              <div>
                <div style="font-size:18px;font-weight:800;color:#0f172a;">
                  ${this.echapperHtml(entree.appName)}
                </div>
                <div style="display:inline-block;margin-top:4px;padding:4px 10px;border-radius:999px;background:${accent};color:#ffffff;font-size:12px;font-weight:700;">
                  ${this.echapperHtml(entree.evenement)}
                </div>
              </div>
            </div>
          </div>

          <div style="padding:18px;">
            <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:#1e293b;">
              ${this.echapperHtml(entree.accroche)}
            </p>
            ${sectionsHtml}
          </div>

          <div style="padding:12px 18px;border-top:1px solid #e2e8f0;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.5;">
            Notification automatique - ${this.echapperHtml(entree.appName)}
          </div>
        </div>
      </div>
    `
  }

  private mapperDestinataireNotification(
    item: TypeDestinataireNotification
  ): TypeDestinataireEmailBrevo | null {
    const email = this.normaliserEmail(item.email)
    if (!email) return null
    const nom = this.normaliserTexte(item.nom)
    return {
      email,
      ...(nom ? { name: nom } : {}),
    }
  }

  private lireTexte(details: Record<string, unknown>, cles: string[]): string {
    for (const cle of cles) {
      const valeur = this.normaliserTexte(details[cle])
      if (valeur) return valeur
    }
    return ''
  }

  private lireNombre(details: Record<string, unknown>, cles: string[]): number | null {
    for (const cle of cles) {
      const nombre = Number(details[cle])
      if (Number.isFinite(nombre)) return Number(nombre.toFixed(2))
    }
    return null
  }

  private formaterMontant(valeur: number | null): string {
    if (valeur == null || !Number.isFinite(valeur)) return '-'
    return `${new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(valeur)} FCFA`
  }

  private formaterDate(valeur: string): string {
    const texte = this.normaliserTexte(valeur)
    if (!texte) return '-'
    const date = new Date(texte)
    if (Number.isNaN(date.getTime())) return texte
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  private formaterValeur(valeur: unknown): string {
    if (valeur == null) return '-'
    if (typeof valeur === 'number') {
      if (!Number.isFinite(valeur)) return '-'
      return String(valeur)
    }
    if (typeof valeur === 'boolean') return valeur ? 'Oui' : 'Non'
    if (valeur instanceof Date) return this.formaterDate(valeur.toISOString())

    if (typeof valeur === 'string') {
      const texte = this.normaliserTexte(valeur)
      if (!texte) return '-'
      const date = new Date(texte)
      if (!Number.isNaN(date.getTime()) && /\d{4}-\d{2}-\d{2}/.test(texte)) {
        return this.formaterDate(texte)
      }
      return texte
    }

    try {
      return JSON.stringify(valeur)
    } catch {
      return String(valeur)
    }
  }

  private resoudreAppName(details: Record<string, unknown>): string {
    return this.lireTexte(details, ['appName']) || 'Keur Ya Aicha'
  }

  private normaliserLogoPublique(valeur: unknown): string | null {
    const url = this.normaliserTexte(valeur)
    if (!url) return null
    if (!/^https?:\/\//i.test(url)) return null
    return url
  }

  private normaliserEmail(valeur: unknown): string | null {
    const email = this.normaliserTexte(valeur)
    if (!email) return null
    const formatValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    return formatValide ? email : null
  }

  private normaliserTexte(valeur: unknown): string {
    return String(valeur || '').trim()
  }

  private versObjet(valeur: unknown): Record<string, unknown> | null {
    if (!valeur || typeof valeur !== 'object' || Array.isArray(valeur)) return null
    return valeur as Record<string, unknown>
  }

  private echapperHtml(valeur: string): string {
    return valeur
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }
}
