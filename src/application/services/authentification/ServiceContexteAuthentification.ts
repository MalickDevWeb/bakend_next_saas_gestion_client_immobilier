import { InterfaceRepositoryAuthentification } from '@/src/domaine/interfaces/repository/InterfaceRepositoryAuthentification'
import { InterfaceServiceJetonAcces } from '@/src/coeur/interfaces/InterfaceServiceJetonAcces'
import { MappeurUtilisateurAuthentification } from '@/src/application/mappers'
import { TypeContexteSessionAuthentification } from '@/src/domaine/types/authentification/TypeContexteSessionAuthentification'
import { t } from '@/src/messages'
import { ERRORS } from '@/src/messages/app/errors'
import { ExceptionAuthentification } from '@/src/application/exceptions'

export class ServiceContexteAuthentification {
  constructor(
    private readonly repositoryAuthentification: InterfaceRepositoryAuthentification,
    private readonly serviceJetonAcces: InterfaceServiceJetonAcces,
    private readonly mappeurUtilisateurAuthentification: MappeurUtilisateurAuthentification
  ) {}

  public async obtenirContexteDepuisJetonAcces(
    jetonAcces: string
  ): Promise<TypeContexteSessionAuthentification> {
    const charge = await this.serviceJetonAcces.verifier(jetonAcces)
    if (!charge.sous || !charge.sessionId || !charge.jti) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_JETON_ACCES_INVALIDE))
    }

    const session = await this.repositoryAuthentification.rechercherSessionParIdAvecUtilisateur(
      charge.sessionId
    )

    if (!session || !session.utilisateur) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_SESSION_INTROUVABLE))
    }

    if (session.estRevoqueeOuCompromise()) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_SESSION_REVOQUEE))
    }

    if (session.estExpiree()) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_SESSION_EXPIREE))
    }

    if (!session.jetonAccesCorrespond(charge.jti)) {
      throw new ExceptionAuthentification(t(ERRORS.AUTH_JETON_ACCES_OBSOLETE))
    }

    const utilisateur = this.mappeurUtilisateurAuthentification.versDto(
      session.utilisateur,
      session.secondeAuthValideeLe,
      session.utilisateur.codesPermissionsAutorisees()
    )

    return {
      utilisateur,
      session: {
        id: session.id,
        csrfToken: session.csrfToken,
        secondeAuthValideeLe: session.secondeAuthValideeLe,
        expireLe: session.expireLe,
      },
    }
  }
}
