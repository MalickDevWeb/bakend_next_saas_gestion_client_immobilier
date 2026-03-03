import { ServiceSante } from '@/src/application/services/ServiceSante'
import { InterfaceValidateurEntree } from '@/src/coeur/interfaces/InterfaceValidateurEntree'

export class ControleurSante {
  constructor(
    private readonly serviceSante: ServiceSante,
    private readonly validateurEntree: InterfaceValidateurEntree
  ) {}

  public async traiterRequete(entree: unknown) {
    const { verbeux = false } = this.validateurEntree.parserRequeteSante(entree)
    return this.serviceSante.obtenirEtat(verbeux)
  }
}
