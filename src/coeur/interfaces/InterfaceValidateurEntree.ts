export interface ParametresRequeteSante {
  verbeux?: boolean
}

export interface InterfaceValidateurEntree {
  parserRequeteSante(entree: unknown): ParametresRequeteSante
}
