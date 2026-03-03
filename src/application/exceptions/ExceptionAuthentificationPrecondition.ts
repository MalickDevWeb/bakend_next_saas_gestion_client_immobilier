import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'

export class ExceptionAuthentificationPrecondition extends ErreurHttp {
  constructor(message: string, details?: unknown) {
    super(CODE_HTTP.PRECONDITION_REQUISE, message, details)
    this.name = 'ExceptionAuthentificationPrecondition'
  }
}
