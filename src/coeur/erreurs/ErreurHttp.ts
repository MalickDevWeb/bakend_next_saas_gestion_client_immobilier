import { ExceptionHttp } from '@/src/coeur/exceptions/ExceptionHttp'

export class ErreurHttp extends ExceptionHttp {
  constructor(codeStatut: number, message: string, details?: unknown) {
    super(codeStatut, message, details)
    this.name = 'ErreurHttp'
  }
}
