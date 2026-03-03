import { ExceptionBase } from '@/src/coeur/exceptions/ExceptionBase'

export class ExceptionHttp extends ExceptionBase {
  public readonly codeStatut: number

  constructor(codeStatut: number, message: string, details?: unknown) {
    super(message, 'EXCEPTION_HTTP', details)
    this.name = 'ExceptionHttp'
    this.codeStatut = codeStatut
  }
}
