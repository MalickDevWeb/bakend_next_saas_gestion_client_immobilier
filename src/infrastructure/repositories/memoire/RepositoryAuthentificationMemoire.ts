import { InterfaceDaoAuthentification } from '@/src/domaine/interfaces/dao/authentification/InterfaceDaoAuthentification'
import { RepositoryAuthentificationAbstrait } from '@/src/infrastructure/repositories/RepositoryAuthentificationAbstrait'

export class RepositoryAuthentificationMemoire extends RepositoryAuthentificationAbstrait {
  constructor(daoAuthentification: InterfaceDaoAuthentification) {
    super(daoAuthentification)
  }
}
