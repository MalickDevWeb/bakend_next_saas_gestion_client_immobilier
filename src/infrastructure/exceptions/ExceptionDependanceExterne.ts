import { ExceptionInfrastructure } from '@/src/infrastructure/exceptions/ExceptionInfrastructure'

export class ExceptionDependanceExterne extends ExceptionInfrastructure {
  constructor(message: string, details?: unknown) {
    super(message, 'EXCEPTION_DEPENDANCE_EXTERNE', details)
    this.name = 'ExceptionDependanceExterne'
  }
}
