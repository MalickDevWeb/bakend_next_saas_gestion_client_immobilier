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
}

export class ServiceEmailBrevo {
  private static readonly URL_BREVO = 'https://api.brevo.com/v3/smtp/email'

  constructor(private readonly options: TypeOptionsServiceEmailBrevo) {}

  public estConfigure(): boolean {
    return Boolean(this.options.cleApi && this.options.expediteurEmail)
  }

  public async envoyerDemandeAdminCreee(donnees: Record<string, unknown>): Promise<boolean> {
    const destinataires = this.extraireDestinataires(donnees)
    if (!destinataires.length) return false

    return this.envoyer({
      destinataires,
      sujet: 'Nouvelle demande administrateur a valider',
      contenuTexte: this.construireContenuTexte('Nouvelle demande administrateur recue.', donnees),
      contenuHtml: this.construireContenuHtml('Nouvelle demande administrateur recue.', donnees),
      tags: ['kya', 'admin-request', 'created'],
    })
  }

  public async envoyerDemandeAdminApprouvee(donnees: Record<string, unknown>): Promise<boolean> {
    const destinataires = this.extraireDestinataires(donnees)
    if (!destinataires.length) return false

    return this.envoyer({
      destinataires,
      sujet: 'Demande administrateur approuvee',
      contenuTexte: this.construireContenuTexte('Votre demande administrateur a ete approuvee.', donnees),
      contenuHtml: this.construireContenuHtml('Votre demande administrateur a ete approuvee.', donnees),
      tags: ['kya', 'admin-request', 'approved'],
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
    const emailDemande =
      this.normaliserEmail(donnees.email) ||
      this.normaliserEmail(details?.email)
    const nomDemande =
      this.normaliserTexte(donnees.name) ||
      this.normaliserTexte(details?.name)

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
      .filter((item): item is { email: string; name: string } => Boolean(item.email))
      .map((item) => ({
        email: item.email,
        ...(item.name ? { name: item.name } : {}),
      }))

    if (!destinataires.length) return false

    const charge = {
      sender: {
        email: this.options.expediteurEmail,
        name: this.options.expediteurNom || 'Keur Ya Aicha',
      },
      to: destinataires,
      subject: entree.sujet,
      textContent: entree.contenuTexte,
      htmlContent: entree.contenuHtml || undefined,
      tags: entree.tags || [],
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
      return reponse.ok
    } catch {
      return false
    }
  }

  private construireContenuTexte(intro: string, donnees: Record<string, unknown>): string {
    const details = this.versObjet(donnees.details)
    const lignes = [
      intro,
      '',
      `Nom: ${this.normaliserTexte(donnees.name) || this.normaliserTexte(details?.name) || '-'}`,
      `Email: ${this.normaliserTexte(donnees.email) || this.normaliserTexte(details?.email) || '-'}`,
      `Telephone: ${this.normaliserTexte(donnees.phone) || this.normaliserTexte(details?.phone) || '-'}`,
      `Entreprise: ${
        this.normaliserTexte(donnees.entrepriseName) || this.normaliserTexte(details?.entrepriseName) || '-'
      }`,
      `Statut: ${this.normaliserTexte(donnees.status) || this.normaliserTexte(details?.status) || '-'}`,
      `Date creation: ${this.normaliserTexte(donnees.createdAt) || this.normaliserTexte(details?.createdAt) || '-'}`,
      `Date approbation: ${this.normaliserTexte(donnees.approvedAt) || this.normaliserTexte(details?.approvedAt) || '-'}`,
    ]
    return lignes.join('\n')
  }

  private construireContenuHtml(intro: string, donnees: Record<string, unknown>): string {
    const details = this.versObjet(donnees.details)
    const lignes = [
      `<p>${this.echapperHtml(intro)}</p>`,
      `<p><strong>Nom:</strong> ${this.echapperHtml(this.normaliserTexte(donnees.name) || this.normaliserTexte(details?.name) || '-')}</p>`,
      `<p><strong>Email:</strong> ${this.echapperHtml(this.normaliserTexte(donnees.email) || this.normaliserTexte(details?.email) || '-')}</p>`,
      `<p><strong>Telephone:</strong> ${this.echapperHtml(this.normaliserTexte(donnees.phone) || this.normaliserTexte(details?.phone) || '-')}</p>`,
      `<p><strong>Entreprise:</strong> ${this.echapperHtml(this.normaliserTexte(donnees.entrepriseName) || this.normaliserTexte(details?.entrepriseName) || '-')}</p>`,
      `<p><strong>Statut:</strong> ${this.echapperHtml(this.normaliserTexte(donnees.status) || this.normaliserTexte(details?.status) || '-')}</p>`,
      `<p><strong>Date creation:</strong> ${this.echapperHtml(this.normaliserTexte(donnees.createdAt) || this.normaliserTexte(details?.createdAt) || '-')}</p>`,
      `<p><strong>Date approbation:</strong> ${this.echapperHtml(this.normaliserTexte(donnees.approvedAt) || this.normaliserTexte(details?.approvedAt) || '-')}</p>`,
    ]
    return lignes.join('\n')
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
