import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteStatutAbonnementAdmin } from '@/src/domaine/entites/administration/EntiteStatutAbonnementAdmin'
import { ObjetValeurMoisComptable } from '@/src/domaine/objets_valeur'
import { TypeModeAbonnementAdmin } from '@/src/domaine/types/administration/TypeModeAbonnementAdmin'

export class BuilderEntiteStatutAbonnementAdmin extends BuilderAbstrait<EntiteStatutAbonnementAdmin> {
  private adminId?: string
  private bloque = false
  private moisEnRetard: string | null = null
  private echeance: Date | null = null
  private moisRequis?: string
  private moisCourant?: string
  private joursGrace = 5
  private modeAbonnement: TypeModeAbonnementAdmin = 'monthly'
  private montantAttendu?: number
  private autoriserMontantLibre = false

  public avecAdminId(valeur: string): this { this.adminId = valeur; return this }
  public avecBloque(valeur: boolean): this { this.bloque = valeur; return this }
  public avecMoisEnRetard(valeur: string | null): this { this.moisEnRetard = valeur; return this }
  public avecEcheance(valeur: Date | null): this { this.echeance = valeur; return this }
  public avecMoisRequis(valeur: string): this { this.moisRequis = valeur; return this }
  public avecMoisCourant(valeur: string): this { this.moisCourant = valeur; return this }
  public avecJoursGrace(valeur: number): this { this.joursGrace = valeur; return this }
  public avecModeAbonnement(valeur: TypeModeAbonnementAdmin): this { this.modeAbonnement = valeur; return this }
  public avecMontantAttendu(valeur: number): this { this.montantAttendu = valeur; return this }
  public avecAutoriserMontantLibre(valeur: boolean): this { this.autoriserMontantLibre = valeur; return this }

  public construire(): EntiteStatutAbonnementAdmin {
    const adminId = this.exigerIdentifiant(this.adminId, 'adminId')
    const moisRequis = new ObjetValeurMoisComptable(this.exiger(this.moisRequis, 'moisRequis')).valeur
    const moisCourant = new ObjetValeurMoisComptable(this.exiger(this.moisCourant, 'moisCourant')).valeur
    const moisEnRetard = this.moisEnRetard ? new ObjetValeurMoisComptable(this.moisEnRetard).valeur : null

    return new EntiteStatutAbonnementAdmin(
      adminId,
      this.bloque,
      moisEnRetard,
      this.echeance,
      moisRequis,
      moisCourant,
      Math.max(0, Math.floor(this.joursGrace)),
      this.modeAbonnement,
      this.montantAttendu,
      this.autoriserMontantLibre
    )
  }
}
