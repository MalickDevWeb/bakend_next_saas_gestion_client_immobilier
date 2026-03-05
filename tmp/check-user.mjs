import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const identifiants = [
  'superadmin@kya.local',
  'admin@kya.local',
  '771234567',
  '771234568',
]

try {
  for (const identifiant of identifiants) {
    const user = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { email: identifiant },
          { telephone: identifiant },
        ],
      },
      select: {
        id: true,
        email: true,
        telephone: true,
        role: true,
        statut: true,
        superAdminTotpActive: true,
      },
    })

    if (user) {
      console.log(`FOUND ${identifiant}:`, user)
    } else {
      console.log(`NOT_FOUND ${identifiant}`)
    }
  }
} catch (err) {
  console.error('ERROR', err?.message || err)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
