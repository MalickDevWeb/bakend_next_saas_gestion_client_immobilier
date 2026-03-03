import { ExceptionInfrastructure } from '@/src/infrastructure/exceptions/ExceptionInfrastructure'

export class ExceptionAccesDonnees extends ExceptionInfrastructure {
  constructor(message: string, details?: unknown) {
    super(message, 'EXCEPTION_ACCES_DONNEES', details)
    this.name = 'ExceptionAccesDonnees'
  }
}
