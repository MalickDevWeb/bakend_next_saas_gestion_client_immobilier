import { ExceptionTechnique } from '@/src/coeur/exceptions/ExceptionTechnique'

export class ExceptionInfrastructure extends ExceptionTechnique {
  constructor(message: string, code = 'EXCEPTION_INFRASTRUCTURE', details?: unknown) {
    super(message, code, details)
    this.name = 'ExceptionInfrastructure'
  }
}
