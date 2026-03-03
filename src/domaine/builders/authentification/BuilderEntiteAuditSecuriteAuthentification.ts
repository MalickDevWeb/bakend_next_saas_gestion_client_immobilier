import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { EntiteAuditSecuriteAuthentification } from '@/src/domaine/entites/authentification/EntiteAuditSecuriteAuthentification'
import { ObjetValeurAgentUtilisateur, ObjetValeurAdresseIp } from '@/src/domaine/objets_valeur'

export class BuilderEntiteAuditSecuriteAuthentification extends BuilderAbstrait<EntiteAuditSecuriteAuthentification> {
  private id?: string
  private action?: string
  private statut?: string
  private details: string | null = null
  private adresseIp: string | null = null
  private agentUtilisateur: string | null = null
  private creeLe?: Date
  private utilisateurId: string | null = null

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecAction(valeur: string): this { this.action = valeur; return this }
  public avecStatut(valeur: string): this { this.statut = valeur; return this }
  public avecDetails(valeur: string | null): this { this.details = valeur; return this }
  public avecAdresseIp(valeur: string | null): this { this.adresseIp = valeur; return this }
  public avecAgentUtilisateur(valeur: string | null): this { this.agentUtilisateur = valeur; return this }
  public avecDateCreation(valeur: Date): this { this.creeLe = valeur; return this }
  public avecUtilisateurId(valeur: string | null): this { this.utilisateurId = valeur; return this }

  public construire(): EntiteAuditSecuriteAuthentification {
    return new EntiteAuditSecuriteAuthentification(
      this.exigerIdentifiant(this.id, 'id'),
      this.exigerTexte(this.action, 'action', 150),
      this.exigerTexte(this.statut, 'statut', 40),
      this.details,
      this.adresseIp ? new ObjetValeurAdresseIp(this.adresseIp).valeur : null,
      this.agentUtilisateur ? new ObjetValeurAgentUtilisateur(this.agentUtilisateur).valeur : null,
      this.dateOuMaintenant(this.creeLe),
      this.utilisateurId ? this.exigerIdentifiant(this.utilisateurId, 'utilisateurId') : null
    )
  }
}
