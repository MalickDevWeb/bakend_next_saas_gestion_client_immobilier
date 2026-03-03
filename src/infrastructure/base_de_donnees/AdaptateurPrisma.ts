import { InterfaceClientBaseDeDonnees } from '@/src/coeur/interfaces/InterfaceClientBaseDeDonnees'
import { ClientPrisma } from '@/src/infrastructure/base_de_donnees/ClientPrisma'

export class AdaptateurPrisma implements InterfaceClientBaseDeDonnees {
  public async verifierConnexion(): Promise<boolean> {
    try {
      const client = ClientPrisma.obtenirInstance()
      await client.$queryRawUnsafe('SELECT 1')
      return true
    } catch {
      return false
    }
  }
}
