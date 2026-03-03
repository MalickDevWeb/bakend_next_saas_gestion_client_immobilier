import { ExceptionApplication } from '@/src/application/exceptions/ExceptionApplication'

export class ExceptionCasUsage extends ExceptionApplication {
  constructor(message: string, details?: unknown) {
    super(message, 'EXCEPTION_CAS_USAGE', details)
    this.name = 'ExceptionCasUsage'
  }
}
