import { z } from 'zod'
import {
  InterfaceValidateurAuthentification,
  ParametresActivationTotpSuperAdmin,
  ParametresConnexionAuthentification,
  ParametresSecondeAuthentification,
} from '@/src/coeur/interfaces/InterfaceValidateurAuthentification'
import { t } from '@/src/messages'
import { ERRORS } from '@/src/messages/app/errors'
import { ExceptionAuthentificationValidation } from '@/src/application/exceptions'

const schemaConnexion = z.object({
  identifiant: z.string().trim().min(3).max(120),
  motDePasse: z.string().min(8).max(256),
})

const schemaSecondeAuthentification = z.union([
  z
    .object({
      codeTotp: z.string().regex(/^\d{6}$/),
    })
    .transform((donnees) => ({ codeTotp: donnees.codeTotp })),
  z
    .object({
      motDePasse: z.string().min(8).max(256),
    })
    .transform((donnees) => ({ motDePasse: donnees.motDePasse })),
  z
    .object({
      password: z.string().min(8).max(256),
    })
    .transform((donnees) => ({ motDePasse: donnees.password })),
])

const schemaActivationTotp = z.object({
  codeTotp: z.string().regex(/^\d{6}$/),
  secretTemporaire: z.string().trim().min(16).max(512),
})

const schemaLimiteAudit = z.coerce.number().int().min(1).max(500)

export class ValidateurAuthentificationZod
  implements InterfaceValidateurAuthentification
{
  public parserConnexion(entree: unknown): ParametresConnexionAuthentification {
    const resultat = schemaConnexion.safeParse(entree)
    if (!resultat.success) {
      throw new ExceptionAuthentificationValidation(
        t(ERRORS.PARAMETRES_INVALIDES),
        resultat.error.flatten()
      )
    }
    return resultat.data
  }

  public parserSecondeAuthentification(entree: unknown): ParametresSecondeAuthentification {
    const resultat = schemaSecondeAuthentification.safeParse(entree)
    if (!resultat.success) {
      throw new ExceptionAuthentificationValidation(
        t(ERRORS.PARAMETRES_INVALIDES),
        resultat.error.flatten()
      )
    }
    return resultat.data
  }

  public parserActivationTotp(entree: unknown): ParametresActivationTotpSuperAdmin {
    const resultat = schemaActivationTotp.safeParse(entree)
    if (!resultat.success) {
      throw new ExceptionAuthentificationValidation(
        t(ERRORS.PARAMETRES_INVALIDES),
        resultat.error.flatten()
      )
    }
    return resultat.data
  }

  public parserLimiteAudit(entree: unknown, valeurParDefaut = 100): number {
    const brut =
      entree === undefined || entree === null || entree === ''
        ? valeurParDefaut
        : entree
    const resultat = schemaLimiteAudit.safeParse(brut)
    if (!resultat.success) {
      throw new ExceptionAuthentificationValidation(
        t(ERRORS.PARAMETRES_INVALIDES),
        resultat.error.flatten()
      )
    }
    return resultat.data
  }
}
