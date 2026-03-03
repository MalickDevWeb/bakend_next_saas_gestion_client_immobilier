import { ExceptionApplication } from '@/src/application/exceptions/ExceptionApplication'

export class ExceptionValidationApplication extends ExceptionApplication {
  constructor(message: string, details?: unknown) {
    super(message, 'EXCEPTION_VALIDATION_APPLICATION', details)
    this.name = 'ExceptionValidationApplication'
  }
}
