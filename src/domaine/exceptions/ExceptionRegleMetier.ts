import { ExceptionDomaine } from '@/src/domaine/exceptions/ExceptionDomaine'

export class ExceptionRegleMetier extends ExceptionDomaine {
  constructor(message: string, details?: unknown) {
    super(message, 'EXCEPTION_REGLE_METIER', details)
    this.name = 'ExceptionRegleMetier'
  }
}
