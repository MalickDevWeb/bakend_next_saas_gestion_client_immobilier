import { z } from 'zod'
import {
  InterfaceValidateurAuthentification,
  ParametresActivationTotpSuperAdmin,
  ParametresChangementMotDePasseAuthentification,
  ParametresConnexionAuthentification,
  ParametresImpersonationAuthentification,
  ParametresSecondeAuthentification,
} from '@/src/coeur/interfaces/InterfaceValidateurAuthentification'
import { t } from '@/src/messages'
import { ERRORS } from '@/src/messages/app/errors'
import { ExceptionAuthentificationValidation } from '@/src/application/exceptions'
import { ObjetValeurEmail, ObjetValeurTelephoneSenegal } from '@/src/domaine/objets_valeur'

const schemaTelephoneConnexion = z
  .string()
  .trim()
  .refine((valeur) => {
    try {
      new ObjetValeurTelephoneSenegal(valeur)
      return true
    } catch {
      return false
    }
  })

const schemaIdentifiantConnexion = z
  .string()
  .trim()
  .refine((valeur) => {
    try {
      new ObjetValeurTelephoneSenegal(valeur)
      return true
    } catch {
      try {
        new ObjetValeurEmail(valeur)
        return true
      } catch {
        return false
      }
    }
  })

const schemaConnexion = z.union([
  z.object({
    identifiant: schemaIdentifiantConnexion,
    motDePasse: z.string().min(8).max(256),
  }),
  z
    .object({
      telephone: schemaTelephoneConnexion,
      motDePasse: z.string().min(8).max(256),
    })
    .transform((donnees) => ({ identifiant: donnees.telephone, motDePasse: donnees.motDePasse })),
  z
    .object({
      numero: schemaTelephoneConnexion,
      motDePasse: z.string().min(8).max(256),
    })
    .transform((donnees) => ({ identifiant: donnees.numero, motDePasse: donnees.motDePasse })),
  z
    .object({
      identifiant: schemaIdentifiantConnexion,
      password: z.string().min(8).max(256),
    })
    .transform((donnees) => ({ identifiant: donnees.identifiant, motDePasse: donnees.password })),
  z
    .object({
      email: z.string().trim().email(),
      motDePasse: z.string().min(8).max(256),
    })
    .transform((donnees) => ({ identifiant: donnees.email, motDePasse: donnees.motDePasse })),
  z
    .object({
      email: z.string().trim().email(),
      password: z.string().min(8).max(256),
    })
    .transform((donnees) => ({ identifiant: donnees.email, motDePasse: donnees.password })),
])

const schemaSecondeAuthentification = z.union([
  z
    .object({
      codeTotp: z.string().regex(/^\d{6}$/),
    })
    .transform((donnees) => ({ codeTotp: donnees.codeTotp })),
  z
    .object({
      identifiant: schemaIdentifiantConnexion,
      motDePasse: z.string().min(8).max(256),
    })
    .transform((donnees) => ({
      identifiant: donnees.identifiant,
      motDePasse: donnees.motDePasse,
    })),
  z
    .object({
      numero: schemaTelephoneConnexion,
      motDePasse: z.string().min(8).max(256),
    })
    .transform((donnees) => ({
      identifiant: donnees.numero,
      motDePasse: donnees.motDePasse,
    })),
  z
    .object({
      identifiant: schemaIdentifiantConnexion,
      password: z.string().min(8).max(256),
    })
    .transform((donnees) => ({
      identifiant: donnees.identifiant,
      motDePasse: donnees.password,
    })),
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

const schemaChangementMotDePasse = z.union([
  z
    .object({
      currentPassword: z.string().min(8).max(256),
      newPassword: z.string().min(8).max(256),
    })
    .transform((donnees) => ({
      motDePasseActuel: donnees.currentPassword,
      nouveauMotDePasse: donnees.newPassword,
    })),
  z.object({
    motDePasseActuel: z.string().min(8).max(256),
    nouveauMotDePasse: z.string().min(8).max(256),
  }),
])

const schemaImpersonation = z.object({
  adminId: z.string().trim().min(1).max(190),
  adminName: z.string().trim().min(1).max(190),
  userId: z.string().trim().min(1).max(190).optional().nullable(),
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

  public parserChangementMotDePasse(
    entree: unknown
  ): ParametresChangementMotDePasseAuthentification {
    const resultat = schemaChangementMotDePasse.safeParse(entree)
    if (!resultat.success) {
      throw new ExceptionAuthentificationValidation(
        t(ERRORS.PARAMETRES_INVALIDES),
        resultat.error.flatten()
      )
    }
    return resultat.data
  }

  public parserImpersonation(entree: unknown): ParametresImpersonationAuthentification {
    const resultat = schemaImpersonation.safeParse(entree)
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
