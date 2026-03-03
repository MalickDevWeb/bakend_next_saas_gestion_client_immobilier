import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'

export class ExceptionAuthentification extends ErreurHttp {
  constructor(message: string, details?: unknown) {
    super(CODE_HTTP.NON_AUTHENTIFIE, message, details)
    this.name = 'ExceptionAuthentification'
  }
}
