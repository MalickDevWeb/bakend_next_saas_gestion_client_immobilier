import { BuilderEntiteUtilisateur } from '@/src/domaine/builders/BuilderEntiteUtilisateur'
import { EnumerationRoleUtilisateur } from '@/src/domaine/enumerations/EnumerationRoleUtilisateur'
import { EntiteUtilisateur } from '@/src/domaine/entites/EntiteUtilisateur'

export class FabriqueUtilisateur {
  public static creer(
    email: string,
    motDePasseHash: string,
    options?: {
      identifiantConnexion?: string
      nomComplet?: string
      telephone?: string
      role?: EnumerationRoleUtilisateur
    }
  ): EntiteUtilisateur {
    const identifiantConnexion =
      options?.identifiantConnexion ||
      email.split('@')[0] ||
      `utilisateur-${Date.now()}`
    const nomComplet = options?.nomComplet || identifiantConnexion

    const builder = new BuilderEntiteUtilisateur()
      .avecIdentifiantConnexion(identifiantConnexion)
      .avecNomComplet(nomComplet)
      .avecEmail(email)
      .avecRole(options?.role || EnumerationRoleUtilisateur.UTILISATEUR)
      .avecStatut('ACTIF')
      .avecMotDePasseHash(motDePasseHash)

    if (options?.telephone) {
      builder.avecTelephone(options.telephone)
    }

    return builder.construire()
  }
}
