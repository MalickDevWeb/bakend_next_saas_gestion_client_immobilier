import { ExceptionDomaine } from '@/src/domaine/exceptions/ExceptionDomaine'

export class ExceptionObjetValeurInvalide extends ExceptionDomaine {
  constructor(message: string, details?: unknown) {
    super(message, 'EXCEPTION_OBJET_VALEUR_INVALIDE', details)
    this.name = 'ExceptionObjetValeurInvalide'
  }
}
