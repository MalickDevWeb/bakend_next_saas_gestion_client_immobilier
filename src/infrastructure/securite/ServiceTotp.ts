import { authenticator } from 'otplib'
import { InterfaceServiceTotp } from '@/src/coeur/interfaces/InterfaceServiceTotp'

export class ServiceTotp implements InterfaceServiceTotp {
  constructor() {
    authenticator.options = {
      window: 1,
      step: 30,
      digits: 6,
    }
  }

  public genererSecret(): string {
    return authenticator.generateSecret()
  }

  public genererOtpAuthUrl(
    nomApplication: string,
    nomUtilisateur: string,
    secret: string
  ): string {
    return authenticator.keyuri(nomUtilisateur, nomApplication, secret)
  }

  public verifierCode(code: string, secret: string): boolean {
    return authenticator.verify({
      token: String(code || '').trim(),
      secret,
    })
  }
}
