import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'

export class ExceptionAuthentificationValidation extends ErreurHttp {
  constructor(message: string, details?: unknown) {
    super(CODE_HTTP.MAUVAISE_REQUETE, message, details)
    this.name = 'ExceptionAuthentificationValidation'
  }
}
