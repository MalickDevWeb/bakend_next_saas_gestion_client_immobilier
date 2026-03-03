export type TypeChargeJetonAcces = {
  sous: string
  role: string
  sessionId: string
  jti: string
}

export interface InterfaceServiceJetonAcces {
  signer(charge: TypeChargeJetonAcces): Promise<string>
  verifier(token: string): Promise<TypeChargeJetonAcces>
}
