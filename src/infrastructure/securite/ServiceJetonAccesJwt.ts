import { SignJWT, jwtVerify } from 'jose'
import {
  InterfaceServiceJetonAcces,
  TypeChargeJetonAcces,
} from '@/src/coeur/interfaces/InterfaceServiceJetonAcces'

export class ServiceJetonAccesJwt implements InterfaceServiceJetonAcces {
  private readonly cleUtf8: Uint8Array

  constructor(cleSecrete: string, private readonly ttlSecondes: number) {
    this.cleUtf8 = new TextEncoder().encode(cleSecrete)
  }

  public async signer(charge: TypeChargeJetonAcces): Promise<string> {
    return new SignJWT({
      role: charge.role,
      sessionId: charge.sessionId,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setSubject(charge.sous)
      .setJti(charge.jti)
      .setIssuedAt()
      .setExpirationTime(`${this.ttlSecondes}s`)
      .sign(this.cleUtf8)
  }

  public async verifier(token: string): Promise<TypeChargeJetonAcces> {
    const resultat = await jwtVerify(token, this.cleUtf8, {
      algorithms: ['HS256'],
    })
    const charge = resultat.payload

    return {
      sous: String(charge.sub || ''),
      role: String(charge.role || ''),
      sessionId: String(charge.sessionId || ''),
      jti: String(charge.jti || ''),
    }
  }
}
