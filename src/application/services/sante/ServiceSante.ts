import { ConfigurationApplication } from '@/src/coeur/configuration/ConfigurationApplication'
import { InterfaceClientBaseDeDonnees } from '@/src/coeur/interfaces/InterfaceClientBaseDeDonnees'
import { STATUS, t } from '@/src/messages'

export class ServiceSante {
  constructor(
    private readonly clientBaseDeDonnees: InterfaceClientBaseDeDonnees,
    private readonly configurationApplication: ConfigurationApplication
  ) {}

  public async obtenirEtat(verbeux = false) {
    const baseDeDonneesDisponible = await this.clientBaseDeDonnees.verifierConnexion()

    const charge = {
      statut: baseDeDonneesDisponible
        ? t(STATUS.OK)
        : t(STATUS.DEGRADE),
      baseDeDonnees: baseDeDonneesDisponible
        ? t(STATUS.BASE_DONNEES_DISPONIBLE)
        : t(STATUS.BASE_DONNEES_INDISPONIBLE),
      uptime: process.uptime(),
      horodatage: new Date().toISOString(),
    }

    if (!verbeux) {
      return charge
    }

    return {
      ...charge,
      environnement: this.configurationApplication.environnement(),
      application: this.configurationApplication.nomApplication(),
    }
  }
}
