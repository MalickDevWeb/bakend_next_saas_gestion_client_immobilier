import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import {
  ObjetValeurCouleurHexadecimale,
  ObjetValeurIdentifiant,
  ObjetValeurTexteNonVide,
  ObjetValeurUrlHttpOuChemin,
} from '@/src/domaine/objets_valeur'
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
    new ObjetValeurIdentifiant(adminId)
    this.nomApplication = new ObjetValeurTexteNonVide(nomApplication, 'nomApplication', 150).valeur
    this.urlLogo = new ObjetValeurUrlHttpOuChemin(urlLogo).valeur
    this.bibliothequeLogos = bibliothequeLogos
      .map((logo) => new ObjetValeurUrlHttpOuChemin(logo).valeur)
      .slice(0, 12)
    this.couleurPrincipale = new ObjetValeurCouleurHexadecimale(couleurPrincipale).valeur
    this.textePiedPage = new ObjetValeurTexteNonVide(textePiedPage, 'textePiedPage', 200).valeur
  }

  public definirLogo(url: string): void {
    const urlNormalisee = String(url || '').trim()
    if (!urlNormalisee) return

    this.urlLogo = new ObjetValeurUrlHttpOuChemin(urlNormalisee).valeur

    this.bibliothequeLogos = [
      this.urlLogo,
      ...this.bibliothequeLogos.filter((logo) => logo !== this.urlLogo),
    ].slice(0, 12)
  }
}
