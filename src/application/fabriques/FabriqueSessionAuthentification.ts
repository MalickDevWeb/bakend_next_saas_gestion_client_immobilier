import { BuilderEntiteSessionAuthentification } from '@/src/domaine/builders/authentification/BuilderEntiteSessionAuthentification'
import { EntiteSessionAuthentification } from '@/src/domaine/entites/authentification/EntiteSessionAuthentification'
import { EntiteUtilisateurAuthentification } from '@/src/domaine/entites/authentification/EntiteUtilisateurAuthentification'

export class FabriqueSessionAuthentification {
  public creerNouvelleSession(entree: {
    sessionId: string
    utilisateur: EntiteUtilisateurAuthentification
    jetonAccesJti: string
    jetonAccesExpireLe: Date
    csrfToken: string
    adresseIp: string
    agentUtilisateur: string
    expireLe: Date
  }): EntiteSessionAuthentification {
    return new BuilderEntiteSessionAuthentification()
      .avecId(entree.sessionId)
      .avecUtilisateur(entree.utilisateur)
      .avecJetonAccesJti(entree.jetonAccesJti)
      .avecJetonAccesExpireLe(entree.jetonAccesExpireLe)
      .avecCsrfToken(entree.csrfToken)
      .avecAdresseIp(entree.adresseIp)
      .avecAgentUtilisateur(entree.agentUtilisateur)
      .avecSecondeAuthValideeLe(null)
      .avecExpireLe(entree.expireLe)
      .avecRevoqueeLe(null)
      .avecCompromissionDetecteeLe(null)
      .construire()
  }

  public creerSessionApresRotation(entree: {
    sessionExistante: EntiteSessionAuthentification
    nouveauJetonAccesJti: string
    nouveauJetonAccesExpireLe: Date
    nouveauCsrfToken: string
    adresseIp: string
    agentUtilisateur: string
  }): EntiteSessionAuthentification {
    return new BuilderEntiteSessionAuthentification()
      .avecId(entree.sessionExistante.id)
      .avecUtilisateur(entree.sessionExistante.utilisateur)
      .avecJetonAccesJti(entree.nouveauJetonAccesJti)
      .avecJetonAccesExpireLe(entree.nouveauJetonAccesExpireLe)
      .avecCsrfToken(entree.nouveauCsrfToken)
      .avecAdresseIp(entree.adresseIp)
      .avecAgentUtilisateur(entree.agentUtilisateur)
      .avecSecondeAuthValideeLe(entree.sessionExistante.secondeAuthValideeLe)
      .avecExpireLe(entree.sessionExistante.expireLe)
      .avecRevoqueeLe(entree.sessionExistante.revoqueeLe)
      .avecCompromissionDetecteeLe(entree.sessionExistante.compromissionDetecteeLe)
      .construire()
  }
}
