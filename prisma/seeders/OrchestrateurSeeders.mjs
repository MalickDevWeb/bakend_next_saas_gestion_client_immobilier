import { SeederConfigurationSysteme } from './SeederConfigurationSysteme.mjs'

export class OrchestrateurSeeders {
  constructor(prisma) {
    this.prisma = prisma
    this.seeders = [new SeederConfigurationSysteme(prisma)]
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
