import { SeederConfigurationSysteme } from './SeederConfigurationSysteme.mjs'
import { SeederSecuriteAuthentification } from './SeederSecuriteAuthentification.mjs'

export class OrchestrateurSeeders {
  constructor(prisma) {
    this.prisma = prisma
    this.seeders = [
      new SeederConfigurationSysteme(prisma),
      new SeederSecuriteAuthentification(prisma),
    ]
  }

  async executerTous() {
    const resultats = []

    for (const seeder of this.seeders) {
      const resultat = await seeder.executer()
      resultats.push(resultat)
    }

    return resultats
  }
}
