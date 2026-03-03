import { ExceptionBase } from '@/src/coeur/exceptions/ExceptionBase'

export class ExceptionDomaine extends ExceptionBase {
  constructor(message: string, code = 'EXCEPTION_DOMAINE', details?: unknown) {
    super(message, code, details)
    this.name = 'ExceptionDomaine'
  }
}
