import { PrismaClient } from '@prisma/client'

export class ClientPrisma {
  private static instance: PrismaClient

  private static buildDbUrl(): string | undefined {
    const raw = process.env.DATABASE_URL
    if (!raw) return raw
    try {
      const url = new URL(raw)
      const ensureParam = (key: string, value: string) => {
        if (!url.searchParams.has(key)) {
          url.searchParams.set(key, value)
        }
      }
      // Neon/pgbouncer: enforce SSL and small pool
      ensureParam('sslmode', 'require')
      ensureParam('pgbouncer', 'true')
      ensureParam('connect_timeout', '10')
      ensureParam('pool_timeout', '30')
      ensureParam('connection_limit', '1')
      return url.toString()
    } catch {
      return raw
    }
  }

  public static obtenirInstance(): PrismaClient {
    if (!ClientPrisma.instance) {
      const dbUrl = ClientPrisma.buildDbUrl()
      ClientPrisma.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
        datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
      })
    }

    return ClientPrisma.instance
  }
}
