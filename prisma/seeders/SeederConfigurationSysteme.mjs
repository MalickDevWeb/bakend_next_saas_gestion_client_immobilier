import { SeederAbstrait } from './SeederAbstrait.mjs'
import { DONNEES_CONFIGURATION_SYSTEME } from './donneesConfigurationSysteme.mjs'

export class SeederConfigurationSysteme extends SeederAbstrait {
  construireValeurs(element) {
    return {
      valeurTexte: element.valeurTexte ?? null,
      valeurNombre: element.valeurNombre ?? null,
      valeurBooleen: element.valeurBooleen ?? null,
    }
  }

  async executer() {
    let compteur = 0
    let crees = 0
    let misAJourDefaults = 0
    let ignores = 0

    for (const element of DONNEES_CONFIGURATION_SYSTEME) {
      const valeurs = this.construireValeurs(element)
      const where = {
        cle_scopeCle: {
          cle: element.cle,
          scopeCle: element.scopeCle,
        },
      }

      const existant = await this.prisma.configurationSysteme.findUnique({ where })

      if (!existant) {
        await this.prisma.configurationSysteme.create({
          data: {
            cle: element.cle,
            ...valeurs,
            typeValeur: element.typeValeur,
            portee: element.portee,
            adminId: element.adminId ?? null,
            scopeCle: element.scopeCle,
            origine: element.origine,
            verrouille: element.verrouille,
          },
        })

        compteur += 1
        crees += 1
        continue
      }

      if (existant.origine === 'DEFAULT' && !existant.verrouille) {
        await this.prisma.configurationSysteme.update({
          where,
          data: {
            ...valeurs,
            typeValeur: element.typeValeur,
            portee: element.portee,
            adminId: element.adminId ?? null,
            origine: element.origine,
            verrouille: element.verrouille,
          },
        })

        compteur += 1
        misAJourDefaults += 1
        continue
      }

      ignores += 1
    }

    return {
      nomSeeder: 'SeederConfigurationSysteme',
      lignesTraitees: compteur,
      lignesCreees: crees,
      lignesMisesAJour: misAJourDefaults,
      lignesIgnorees: ignores,
    }
  }
}
