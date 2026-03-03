import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { InterfaceServiceChiffrement } from '@/src/coeur/interfaces/InterfaceServiceChiffrement'

export class ServiceChiffrementSymetrique implements InterfaceServiceChiffrement {
  constructor(private readonly cleSecrete: string) {}

  public chiffrer(texteClair: string): string {
    const cle = this.deriverCle(this.cleSecrete)
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', cle, iv)

    const texteChiffre = Buffer.concat([
      cipher.update(texteClair, 'utf8'),
      cipher.final(),
    ])
    const tag = cipher.getAuthTag()

    return `${iv.toString('base64url')}.${tag.toString('base64url')}.${texteChiffre.toString('base64url')}`
  }

  public dechiffrer(texteChiffre: string): string {
    const [ivB64, tagB64, chargeB64] = String(texteChiffre || '').split('.')
    if (!ivB64 || !tagB64 || !chargeB64) {
      throw new Error('Format de secret chiffre invalide')
    }

    const cle = this.deriverCle(this.cleSecrete)
    const decipher = createDecipheriv(
      'aes-256-gcm',
      cle,
      Buffer.from(ivB64, 'base64url')
    )
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'))

    const texte = Buffer.concat([
      decipher.update(Buffer.from(chargeB64, 'base64url')),
      decipher.final(),
    ])

    return texte.toString('utf8')
  }

  private deriverCle(valeur: string): Buffer {
    return createHash('sha256').update(valeur).digest()
  }
}
