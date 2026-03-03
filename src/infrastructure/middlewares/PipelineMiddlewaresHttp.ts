import { NextRequest, NextResponse } from 'next/server'
import { InterfaceMiddlewareHttp } from '@/src/infrastructure/middlewares/InterfaceMiddlewareHttp'
import { MiddlewareJournalisation } from '@/src/infrastructure/middlewares/MiddlewareJournalisation'
import { MiddlewareMaintenance } from '@/src/infrastructure/middlewares/MiddlewareMaintenance'

export class PipelineMiddlewaresHttp {
  constructor(
    private readonly middlewares: InterfaceMiddlewareHttp[] = [
      new MiddlewareJournalisation(),
      new MiddlewareMaintenance(),
    ]
  ) {}

  public async executer(requete: NextRequest): Promise<NextResponse | null> {
    for (const middleware of this.middlewares) {
      const resultat = await middleware.traiter(requete)
      if (resultat) {
        return resultat
      }
    }

    return null
  }
}

export const pipelineMiddlewaresHttp = new PipelineMiddlewaresHttp()
