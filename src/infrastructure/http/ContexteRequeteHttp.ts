import { NextRequest } from 'next/server'
import { UtilitairesSecurite } from '@/src/infrastructure/securite/UtilitairesSecurite'

export class ContexteRequeteHttp {
  constructor(private readonly utilitairesSecurite: UtilitairesSecurite) {}

  public extraireSecurite(requete: NextRequest) {
    return {
      adresseIp: this.utilitairesSecurite.extraireAdresseIp(requete),
      agentUtilisateur: this.utilitairesSecurite.extraireAgentUtilisateur(requete),
    }
  }
}
