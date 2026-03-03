import { z } from 'zod'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { ERRORS, t } from '@/src/messages'
import {
  InterfaceValidateurEntree,
  ParametresRequeteSante,
} from '@/src/coeur/interfaces/InterfaceValidateurEntree'

const schemaRequeteSante = z.object({
  verbeux: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((valeur) => {
      if (typeof valeur === 'boolean') return valeur
      if (typeof valeur === 'string') return valeur.toLowerCase() === 'true'
      return undefined
    }),
})

export class ValidateurZod implements InterfaceValidateurEntree {
  public parserRequeteSante(entree: unknown): ParametresRequeteSante {
    const resultat = schemaRequeteSante.safeParse(entree)

    if (!resultat.success) {
      throw new ErreurHttp(400, t(ERRORS.PARAMETRES_INVALIDES), resultat.error.flatten())
    }

    return resultat.data
  }
}
