import { TypeTentativeConnexionAuthentification } from '@/src/domaine/types/authentification/TypeTentativeConnexionAuthentification'

export type DonneesPermissionUtilisateurAuth = {
  code: string
  autorise: boolean
}

export type DonneesUtilisateurAuthentification = {
  id: string
  telephone: string
  email: string
  motDePasseHache: string
  role: string
  statut: string
  superAdminTotpActive: boolean
  superAdminTotpSecret: string | null
  permissions: DonneesPermissionUtilisateurAuth[]
}

export type DonneesSessionAuthentification = {
  id: string
  jetonAccesJti: string
  jetonAccesExpireLe: Date
  csrfToken: string
  adresseIp: string
  agentUtilisateur: string
  secondeAuthValideeLe: Date | null
  expireLe: Date
  revoqueeLe: Date | null
  compromissionDetecteeLe: Date | null
  utilisateur: DonneesUtilisateurAuthentification
}

export type DonneesJetonRefreshAuthentification = {
  id: string
  hachageToken: string
  sessionId: string
  expireLe: Date
  utiliseLe: Date | null
  revoqueLe: Date | null
  remplaceParId: string | null
  session: DonneesSessionAuthentification
}

export type EntreeCreationSessionAuthentification = {
  sessionId: string
  utilisateurId: string
  jetonAccesJti: string
  jetonAccesExpireLe: Date
  csrfToken: string
  adresseIp: string
  agentUtilisateur: string
  expireLeSession: Date
  hachageJetonRefresh: string
  expireLeRefresh: Date
}

export type EntreeRotationJetonRefresh = {
  sessionId: string
  jetonRefreshActuelId: string
  hachageNouveauJetonRefresh: string
  expireLeRefresh: Date
  nouveauJtiJetonAcces: string
  expireLeJetonAcces: Date
  nouveauCsrfToken: string
  adresseIp: string
  agentUtilisateur: string
  dateRotation: Date
}

export type EntreeTentativeConnexion = {
  id?: string
  identifiant: string
  adresseIp: string
  type: TypeTentativeConnexionAuthentification
  succes: boolean
  creeLe?: Date
  utilisateurId?: string
}

export type DonneesTentativeConnexion = {
  id: string
  identifiant: string
  adresseIp: string
  type: TypeTentativeConnexionAuthentification
  succes: boolean
  creeLe: Date
  utilisateurId: string | null
}

export type DonneesAuditSecurite = {
  id: string
  action: string
  statut: string
  details: string | null
  adresseIp: string | null
  agentUtilisateur: string | null
  creeLe: Date
  utilisateurId: string | null
}

export interface InterfaceDaoAuthentification {
  rechercherUtilisateurParTelephoneOuEmail(
    identifiant: string
  ): Promise<DonneesUtilisateurAuthentification | null>

  rechercherUtilisateurParId(
    utilisateurId: string
  ): Promise<DonneesUtilisateurAuthentification | null>

  creerSessionEtJetonRefresh(
    entree: EntreeCreationSessionAuthentification
  ): Promise<void>

  rechercherSessionParIdAvecUtilisateur(
    sessionId: string
  ): Promise<DonneesSessionAuthentification | null>

  rechercherJetonRefreshParHachageAvecSession(
    hachageToken: string
  ): Promise<DonneesJetonRefreshAuthentification | null>

  revoquerJetonRefreshParId(jetonRefreshId: string, dateRevocation: Date): Promise<void>

  effectuerRotationJetonRefresh(entree: EntreeRotationJetonRefresh): Promise<void>

  revoquerSessionEtJetonsRefresh(sessionId: string, dateRevocation: Date): Promise<void>

  activerTotpSuperAdmin(utilisateurId: string, secretChiffre: string): Promise<void>

  rechercherTotpSuperAdmin(utilisateurId: string): Promise<{
    id: string
    superAdminTotpActive: boolean
    superAdminTotpSecret: string | null
  } | null>

  definirSecondeAuthSession(sessionId: string, dateValidation: Date): Promise<void>

  lireStatutTotpSuperAdmin(utilisateurId: string): Promise<boolean>

  listerAuditsSecurite(limite: number): Promise<DonneesAuditSecurite[]>

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
  ): Promise<DonneesTentativeConnexion[]>

  enregistrerTentativeConnexion(entree: EntreeTentativeConnexion): Promise<void>
}
