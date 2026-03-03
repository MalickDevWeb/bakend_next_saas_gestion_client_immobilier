import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { BuilderEntitePermissionsAdmin } from '@/src/domaine/builders/BuilderEntitePermissionsAdmin'
import { EntiteAdmin } from '@/src/domaine/entites/EntiteAdmin'
import { EntitePermissionsAdmin } from '@/src/domaine/entites/EntitePermissionsAdmin'
import { ObjetValeurEmail } from '@/src/domaine/objets_valeur'
import { TypeModeAbonnementAdmin } from '@/src/domaine/types/TypeModeAbonnementAdmin'
import { TypeStatutAdmin } from '@/src/domaine/types/TypeStatutAdmin'

export class BuilderEntiteAdmin extends BuilderAbstrait<EntiteAdmin> {
  private id?: string
  private utilisateurId?: string
  private nomUtilisateur?: string
  private nom?: string
  private email?: string
  private statut: TypeStatutAdmin = 'EN_ATTENTE'
  private entrepriseId?: string
  private modeAbonnement: TypeModeAbonnementAdmin = 'monthly'
  private montantMensuelAbonnement = 0
  private montantAnnuelAbonnement = 0
  private autoriserMontantPersonnalise = false
  private permissions: EntitePermissionsAdmin = new BuilderEntitePermissionsAdmin().construire()
  private creeLe?: Date

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecUtilisateurId(valeur: string): this { this.utilisateurId = valeur; return this }
  public avecNomUtilisateur(valeur: string): this { this.nomUtilisateur = valeur; return this }
  public avecNom(valeur: string): this { this.nom = valeur; return this }
  public avecEmail(valeur: string): this { this.email = valeur; return this }
  public avecStatut(valeur: TypeStatutAdmin): this { this.statut = valeur; return this }
  public avecEntrepriseId(valeur: string): this { this.entrepriseId = valeur; return this }
  public avecModeAbonnement(valeur: TypeModeAbonnementAdmin): this { this.modeAbonnement = valeur; return this }
  public avecMontantMensuelAbonnement(valeur: number): this { this.montantMensuelAbonnement = valeur; return this }
  public avecMontantAnnuelAbonnement(valeur: number): this { this.montantAnnuelAbonnement = valeur; return this }
  public avecAutoriserMontantPersonnalise(valeur: boolean): this { this.autoriserMontantPersonnalise = valeur; return this }
  public avecPermissions(valeur: EntitePermissionsAdmin): this { this.permissions = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }

  public construire(): EntiteAdmin {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const utilisateurId = this.exigerIdentifiant(this.utilisateurId, 'utilisateurId')
    const nomUtilisateur = this.exigerTexte(this.nomUtilisateur, 'nomUtilisateur')
    const nom = this.exigerTexte(this.nom, 'nom')
    const email = new ObjetValeurEmail(this.exiger(this.email, 'email')).valeur
    const entrepriseId = this.entrepriseId ? this.exigerIdentifiant(this.entrepriseId, 'entrepriseId') : undefined

    return new EntiteAdmin(
      id,
      utilisateurId,
      nomUtilisateur,
      nom,
      email,
      this.statut,
      entrepriseId,
      this.modeAbonnement,
      this.montantNonNegatif(this.montantMensuelAbonnement, 'montantMensuelAbonnement'),
      this.montantNonNegatif(this.montantAnnuelAbonnement, 'montantAnnuelAbonnement'),
      this.autoriserMontantPersonnalise,
      this.permissions,
      this.dateOuMaintenant(this.creeLe)
    )
  }
}
