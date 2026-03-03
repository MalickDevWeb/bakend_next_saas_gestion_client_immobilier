import { createHash, randomBytes } from 'node:crypto'
import { NextRequest } from 'next/server'
import { InterfaceUtilitairesSecurite } from '@/src/coeur/interfaces/InterfaceUtilitairesSecurite'

export class UtilitairesSecurite implements InterfaceUtilitairesSecurite {
  public tokenAleatoire(taille = 48): string {
    return randomBytes(taille).toString('base64url')
  }

  public hachageSha256(valeur: string): string {
    return createHash('sha256').update(valeur).digest('hex')
  }

  public extraireAdresseIp(requete: NextRequest): string {
    const xForwardedFor = requete.headers.get('x-forwarded-for')
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0]?.trim() || 'inconnue'
    }
    return requete.headers.get('x-real-ip') || 'inconnue'
  }

  public extraireAgentUtilisateur(requete: NextRequest): string {
    return requete.headers.get('user-agent') || 'inconnu'
  }
}
