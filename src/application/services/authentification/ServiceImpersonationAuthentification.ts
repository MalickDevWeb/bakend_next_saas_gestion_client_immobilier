import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { ServiceContexteAuthentification } from '@/src/application/services/authentification/ServiceContexteAuthentification'
import { InterfaceRepositoryAuthentification } from '@/src/domaine/interfaces/repository/InterfaceRepositoryAuthentification'
import { ObjetValeurIdentifiant, ObjetValeurTexteNonVide } from '@/src/domaine/objets_valeur'
import { t } from '@/src/messages'
import { ERRORS } from '@/src/messages/app/errors'
import {
  ExceptionAuthentificationAutorisation,
  ExceptionAuthentificationValidation,
} from '@/src/application/exceptions'

export class ServiceImpersonationAuthentification {
  constructor(
    private readonly serviceContexteAuthentification: ServiceContexteAuthentification,
    private readonly repositoryAuthentification: InterfaceRepositoryAuthentification
  ) {}

  public async definirImpersonation(
    jetonAcces: string,
    adminId: string,
    adminName: string,
    userId?: string | null
  ): Promise<DtoEtatImpersonation> {
    const contexte = await this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
      jetonAcces
    )
    const role = String(contexte.utilisateur.role || '').toUpperCase()
    if (role !== 'SUPER_ADMIN') {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_ACCES_SUPER_ADMIN))
    }
    if (contexte.utilisateur.superAdminSecondAuthRequired) {
      throw new ExceptionAuthentificationAutorisation(
        t(ERRORS.AUTH_SECONDE_AUTH_SUPER_ADMIN_REQUISE),
        {
          code: 'SUPER_ADMIN_SECOND_AUTH_REQUIRED',
        }
      )
    }

    const adminIdValide = new ObjetValeurIdentifiant(adminId).valeur
    const adminNameValide = new ObjetValeurTexteNonVide(adminName, 'adminName', 190).valeur
    const userIdValide = userId ? new ObjetValeurIdentifiant(userId).valeur : null
    const cibleUtilisateurId = userIdValide || adminIdValide
    const cible = await this.repositoryAuthentification.rechercherUtilisateurParId(
      cibleUtilisateurId
    )
    if (!cible || String(cible.role || '').toUpperCase() !== 'ADMIN') {
      throw new ExceptionAuthentificationValidation(t(ERRORS.PARAMETRES_INVALIDES), {
        champ: userIdValide ? 'userId' : 'adminId',
        raison: 'CIBLE_IMPERSONATION_DOIT_ETRE_ADMIN',
      })
    }
    if (!cible.estActif()) {
      throw new ExceptionAuthentificationValidation(t(ERRORS.PARAMETRES_INVALIDES), {
        champ: userIdValide ? 'userId' : 'adminId',
        raison: 'CIBLE_IMPERSONATION_INACTIVE',
      })
    }

    return {
      adminId: adminIdValide,
      adminName: adminNameValide,
      userId: userIdValide,
    }
  }

  public async effacerImpersonation(jetonAcces: string): Promise<void> {
    const contexte = await this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
      jetonAcces
    )
    const role = String(contexte.utilisateur.role || '').toUpperCase()
    if (role !== 'SUPER_ADMIN') {
      throw new ExceptionAuthentificationAutorisation(t(ERRORS.AUTH_ACCES_SUPER_ADMIN))
    }
  }
}
