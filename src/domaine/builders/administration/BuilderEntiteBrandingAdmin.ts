import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteBrandingAdmin } from '@/src/domaine/entites/administration/EntiteBrandingAdmin'
import {
  ObjetValeurCouleurHexadecimale,
  ObjetValeurUrlHttpOuChemin,
} from '@/src/domaine/objets_valeur'

export class BuilderEntiteBrandingAdmin extends BuilderAbstrait<EntiteBrandingAdmin> {
  private adminId?: string
  private nomApplication = 'Keur Ya Aicha'
  private urlLogo = '/logo.png'
  private bibliothequeLogos: string[] = []
  private couleurPrincipale = '#121B53'
  private textePiedPage = '© Keur Ya Aicha'

  public avecAdminId(valeur: string): this { this.adminId = valeur; return this }
  public avecNomApplication(valeur: string): this { this.nomApplication = valeur; return this }
  public avecUrlLogo(valeur: string): this { this.urlLogo = valeur; return this }
  public avecBibliothequeLogos(valeur: string[]): this { this.bibliothequeLogos = valeur; return this }
  public avecCouleurPrincipale(valeur: string): this { this.couleurPrincipale = valeur; return this }
  public avecTextePiedPage(valeur: string): this { this.textePiedPage = valeur; return this }

  public construire(): EntiteBrandingAdmin {
    const adminId = this.exigerIdentifiant(this.adminId, 'adminId')
    const nomApplication = this.exigerTexte(this.nomApplication, 'nomApplication')
    const urlLogo = new ObjetValeurUrlHttpOuChemin(this.urlLogo).valeur
    const couleur = new ObjetValeurCouleurHexadecimale(this.couleurPrincipale).valeur
    const textePiedPage = this.exigerTexte(this.textePiedPage, 'textePiedPage')
    const bibliotheque = this.bibliothequeLogos
      .map((valeur) => {
        try {
          return new ObjetValeurUrlHttpOuChemin(valeur).valeur
        } catch {
          return ''
        }
      })
      .filter(Boolean)

    return new EntiteBrandingAdmin(adminId, nomApplication, urlLogo, bibliotheque, couleur, textePiedPage)
  }
}
