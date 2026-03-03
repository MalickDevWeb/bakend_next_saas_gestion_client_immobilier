import { DtoUtilisateurAuthentifie } from '@/src/application/dtos/authentification/DtoAuthentification'
import { ConfigurationSecurite } from '@/src/coeur/configuration/ConfigurationSecurite'
import { EntiteUtilisateurAuthentification } from '@/src/domaine/entites/authentification/EntiteUtilisateurAuthentification'

export class MappeurUtilisateurAuthentification {
  constructor(private readonly configurationSecurite: ConfigurationSecurite) {}

  public versDto(
    utilisateur: EntiteUtilisateurAuthentification,
    secondeAuthValideeLe: Date | null,
    permissions: string[]
  ): DtoUtilisateurAuthentifie {
    const role = String(utilisateur.role || '').toUpperCase()
    const ttl = this.configurationSecurite.dureeSecondeAuthSuperAdminMillisecondes()
    const secondeAuthValide =
      secondeAuthValideeLe instanceof Date &&
      Date.now() - secondeAuthValideeLe.getTime() <= ttl

    const secondeAuthRequise = role === 'SUPER_ADMIN' ? !secondeAuthValide : false

    return {
      id: utilisateur.id,
      nomUtilisateur: utilisateur.nomUtilisateur,
      email: utilisateur.email,
      role,
      statut: utilisateur.statut,
      permissions,
      superAdminSecondAuthRequired: secondeAuthRequise,
    }
  }
}
