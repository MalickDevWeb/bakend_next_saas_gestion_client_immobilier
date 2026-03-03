import { PrismaClient } from '@prisma/client'

export class ClientPrisma {
  private static instance: PrismaClient

  public static obtenirInstance(): PrismaClient {
    if (!ClientPrisma.instance) {
      ClientPrisma.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      })
    }

    return ClientPrisma.instance
  }
}
