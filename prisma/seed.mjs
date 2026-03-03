import { PrismaClient } from '@prisma/client'
import { OrchestrateurSeeders } from './seeders/OrchestrateurSeeders.mjs'

const prisma = new PrismaClient()

async function principal() {
  console.info('[SEED] Demarrage des seeders...')

  const orchestrateur = new OrchestrateurSeeders(prisma)
  const resultats = await orchestrateur.executerTous()

  for (const resultat of resultats) {
    const details = [
      `traitees=${resultat.lignesTraitees ?? 0}`,
      `creees=${resultat.lignesCreees ?? 0}`,
      `misesAJour=${resultat.lignesMisesAJour ?? 0}`,
      `ignorees=${resultat.lignesIgnorees ?? 0}`,
    ].join(', ')

    console.info(
      `[SEED] ${resultat.nomSeeder}: ${details}`
    )
  }

  console.info('[SEED] Termine avec succes.')
}

principal()
  .catch((erreur) => {
    console.error('[SEED] Echec:', erreur)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
