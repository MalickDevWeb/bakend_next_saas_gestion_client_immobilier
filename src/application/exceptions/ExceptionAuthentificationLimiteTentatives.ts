import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'

export class ExceptionAuthentificationLimiteTentatives extends ErreurHttp {
  constructor(message: string, details?: unknown) {
    super(CODE_HTTP.TROP_DE_REQUETES, message, details)
    this.name = 'ExceptionAuthentificationLimiteTentatives'
  }
}
