import { ExceptionBase } from '@/src/coeur/exceptions/ExceptionBase'

export class ExceptionTechnique extends ExceptionBase {
  constructor(message: string, code = 'EXCEPTION_TECHNIQUE', details?: unknown) {
    super(message, code, details)
    this.name = 'ExceptionTechnique'
  }
}
