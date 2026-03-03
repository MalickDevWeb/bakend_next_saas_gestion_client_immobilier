import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'

export class ExceptionAuthentificationAutorisation extends ErreurHttp {
  constructor(message: string, details?: unknown) {
    super(CODE_HTTP.INTERDIT, message, details)
    this.name = 'ExceptionAuthentificationAutorisation'
  }
}
