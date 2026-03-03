import { ExceptionBase } from '@/src/coeur/exceptions/ExceptionBase'

export class ExceptionApplication extends ExceptionBase {
  constructor(message: string, code = 'EXCEPTION_APPLICATION', details?: unknown) {
    super(message, code, details)
    this.name = 'ExceptionApplication'
  }
}
