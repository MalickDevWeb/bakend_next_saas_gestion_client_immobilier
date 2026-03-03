import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
export class EntiteBrandingAdmin extends ObjetDomaine {
  constructor(
    public readonly adminId: string,
    public nomApplication: string,
    public urlLogo: string,
    public bibliothequeLogos: string[] = [],
    public couleurPrincipale = '#121B53',
    public textePiedPage = '© Keur Ya Aicha'
  ) {
    super()
  }

  public definirLogo(url: string): void {
    this.urlLogo = url.trim()
    if (!this.urlLogo) return

    this.bibliothequeLogos = [
      this.urlLogo,
      ...this.bibliothequeLogos.filter((logo) => logo !== this.urlLogo),
    ].slice(0, 12)
  }
}
