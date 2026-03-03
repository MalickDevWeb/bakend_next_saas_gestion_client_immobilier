import { ExceptionDomaine } from '@/src/domaine/exceptions/ExceptionDomaine'

export class ExceptionEntiteInvalide extends ExceptionDomaine {
  constructor(message: string, details?: unknown) {
    super(message, 'EXCEPTION_ENTITE_INVALIDE', details)
    this.name = 'ExceptionEntiteInvalide'
  }
}
