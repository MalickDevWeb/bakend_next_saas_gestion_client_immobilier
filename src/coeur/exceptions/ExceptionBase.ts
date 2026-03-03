export class ExceptionBase extends Error {
  public readonly code: string
  public readonly details?: unknown

  constructor(message: string, code = 'EXCEPTION_BASE', details?: unknown) {
    super(message)
    this.name = 'ExceptionBase'
    this.code = code
    this.details = details
  }
}
