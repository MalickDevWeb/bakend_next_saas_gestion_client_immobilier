import { ServiceSante } from '@/src/application/services/ServiceSante'
import { ControleurSante } from '@/src/controleurs/ControleurSante'
import { AdaptateurPrisma } from '@/src/infrastructure/base_de_donnees/AdaptateurPrisma'
import { ValidateurZod } from '@/src/infrastructure/validateurs/ValidateurZod'

class ConteneurDependances {
  public clientBaseDeDonnees = new AdaptateurPrisma()
  public validateurEntree = new ValidateurZod()
  public serviceSante = new ServiceSante(this.clientBaseDeDonnees)
  public controleurSante = new ControleurSante(this.serviceSante, this.validateurEntree)
}

export const conteneurDependances = new ConteneurDependances()
