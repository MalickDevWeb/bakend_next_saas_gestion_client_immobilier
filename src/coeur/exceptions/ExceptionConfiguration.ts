import { ExceptionBase } from '@/src/coeur/exceptions/ExceptionBase'

export class ExceptionConfiguration extends ExceptionBase {
  constructor(message: string, details?: unknown) {
    super(message, 'EXCEPTION_CONFIGURATION', details)
    this.name = 'ExceptionConfiguration'
  }
}
