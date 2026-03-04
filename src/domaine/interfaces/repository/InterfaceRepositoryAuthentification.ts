import { EntiteAuditSecuriteAuthentification } from '@/src/domaine/entites/authentification/EntiteAuditSecuriteAuthentification'
import { EntiteJetonRefresh } from '@/src/domaine/entites/authentification/EntiteJetonRefresh'
import { EntiteSessionAuthentification } from '@/src/domaine/entites/authentification/EntiteSessionAuthentification'
import { EntiteTentativeConnexion } from '@/src/domaine/entites/authentification/EntiteTentativeConnexion'
import { EntiteUtilisateurAuthentification } from '@/src/domaine/entites/authentification/EntiteUtilisateurAuthentification'
import { TypeCommandeCreationSessionAuthentification } from '@/src/domaine/types/authentification/TypeCommandeCreationSessionAuthentification'
import { TypeCommandeRotationJetonRefreshAuthentification } from '@/src/domaine/types/authentification/TypeCommandeRotationJetonRefreshAuthentification'
import { TypeTentativeConnexionAuthentification } from '@/src/domaine/types/authentification/TypeTentativeConnexionAuthentification'
import { TypeTotpSuperAdminAuthentification } from '@/src/domaine/types/authentification/TypeTotpSuperAdminAuthentification'

export interface InterfaceRepositoryAuthentification {
  rechercherUtilisateurParTelephoneOuEmail(
    identifiant: string
  ): Promise<EntiteUtilisateurAuthentification | null>

  creerSessionEtJetonRefresh(
    commande: TypeCommandeCreationSessionAuthentification
  ): Promise<void>

  rechercherSessionParIdAvecUtilisateur(
    sessionId: string
  ): Promise<EntiteSessionAuthentification | null>

  rechercherJetonRefreshParHachageAvecSession(
    hachageToken: string
  ): Promise<EntiteJetonRefresh | null>

  revoquerJetonRefreshParId(jetonRefreshId: string, dateRevocation: Date): Promise<void>

  effectuerRotationJetonRefresh(
    commande: TypeCommandeRotationJetonRefreshAuthentification
  ): Promise<void>

  revoquerSessionEtJetonsRefresh(sessionId: string, dateRevocation: Date): Promise<void>

  activerTotpSuperAdmin(utilisateurId: string, secretChiffre: string): Promise<void>

  rechercherTotpSuperAdmin(utilisateurId: string): Promise<TypeTotpSuperAdminAuthentification | null>

  definirSecondeAuthSession(sessionId: string, dateValidation: Date): Promise<void>

  lireStatutTotpSuperAdmin(utilisateurId: string): Promise<boolean>

  listerAuditsSecurite(limite: number): Promise<EntiteAuditSecuriteAuthentification[]>

  marquerCompromissionSessionEtRevoquerJetons(
    sessionId: string,
    dateCompromission: Date
  ): Promise<void>

  listerTentativesEchecRecentes(
    identifiant: string,
    adresseIp: string,
    type: TypeTentativeConnexionAuthentification,
    dateDebutFenetre: Date,
    limite: number
  ): Promise<EntiteTentativeConnexion[]>

  enregistrerTentativeConnexion(entite: EntiteTentativeConnexion): Promise<void>
}
