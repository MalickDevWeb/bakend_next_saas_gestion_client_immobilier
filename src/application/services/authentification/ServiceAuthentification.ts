import {
  DtoListeAuditsSecurite,
  DtoReponseAuthentification,
  DtoStatutTotpSuperAdmin,
  DtoUtilisateurAuthentifie,
} from '@/src/application/dtos/authentification/DtoAuthentification'
import { ServiceAuditAuthentification } from '@/src/application/services/authentification/ServiceAuditAuthentification'
import { ServiceAutorisationAuthentification } from '@/src/application/services/authentification/ServiceAutorisationAuthentification'
import { ServiceContexteAuthentification } from '@/src/application/services/authentification/ServiceContexteAuthentification'
import { ServiceSessionAuthentification } from '@/src/application/services/authentification/ServiceSessionAuthentification'
import { ServiceTotpSuperAdminAuthentification } from '@/src/application/services/authentification/ServiceTotpSuperAdminAuthentification'
import { TypeContexteRequeteAuthentification } from '@/src/domaine/types/authentification/TypeContexteRequeteAuthentification'
import { TypeContexteSessionAuthentification } from '@/src/domaine/types/authentification/TypeContexteSessionAuthentification'
import { TypeResultatConnexionAuthentification } from '@/src/domaine/types/authentification/TypeResultatConnexionAuthentification'
import { TypeResultatRafraichissementAuthentification } from '@/src/domaine/types/authentification/TypeResultatRafraichissementAuthentification'
import { TypeResultatTotpInitialisationAuthentification } from '@/src/domaine/types/authentification/TypeResultatTotpInitialisationAuthentification'

export class ServiceAuthentification {
  constructor(
    private readonly serviceSessionAuthentification: ServiceSessionAuthentification,
    private readonly serviceContexteAuthentification: ServiceContexteAuthentification,
    private readonly serviceTotpSuperAdminAuthentification: ServiceTotpSuperAdminAuthentification,
    private readonly serviceAutorisationAuthentification: ServiceAutorisationAuthentification,
    private readonly serviceAuditAuthentification: ServiceAuditAuthentification
  ) {}

  public async connexion(
    identifiant: string,
    motDePasse: string,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<TypeResultatConnexionAuthentification> {
    return this.serviceSessionAuthentification.connexion(identifiant, motDePasse, contexte)
  }

  public async obtenirContexteDepuisJetonAcces(
    jetonAcces: string
  ): Promise<TypeContexteSessionAuthentification> {
    return this.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(jetonAcces)
  }

  public async rafraichirSession(
    jetonRefreshClair: string,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<TypeResultatRafraichissementAuthentification> {
    return this.serviceSessionAuthentification.rafraichirSession(jetonRefreshClair, contexte)
  }

  public async deconnexion(
    jetonAcces: string | null,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<void> {
    return this.serviceSessionAuthentification.deconnexion(jetonAcces, contexte)
  }

  public async initialiserTotpSuperAdmin(
    jetonAcces: string
  ): Promise<TypeResultatTotpInitialisationAuthentification> {
    return this.serviceTotpSuperAdminAuthentification.initialiserTotpSuperAdmin(jetonAcces)
  }

  public async activerTotpSuperAdmin(
    jetonAcces: string,
    secretTemporaire: string,
    codeTotp: string,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<DtoReponseAuthentification> {
    return this.serviceTotpSuperAdminAuthentification.activerTotpSuperAdmin(
      jetonAcces,
      secretTemporaire,
      codeTotp,
      contexte
    )
  }

  public async verifierSecondeAuthSuperAdmin(
    jetonAcces: string,
    codeTotp: string,
    contexte: TypeContexteRequeteAuthentification
  ): Promise<DtoReponseAuthentification> {
    return this.serviceTotpSuperAdminAuthentification.verifierSecondeAuthSuperAdmin(
      jetonAcces,
      codeTotp,
      contexte
    )
  }

  public async verifierPermission(
    jetonAcces: string,
    permission: string
  ): Promise<DtoUtilisateurAuthentifie> {
    return this.serviceAutorisationAuthentification.verifierPermission(jetonAcces, permission)
  }

  public async exigerSecondeAuthSuperAdmin(jetonAcces: string): Promise<DtoUtilisateurAuthentifie> {
    return this.serviceAutorisationAuthentification.exigerSecondeAuthSuperAdmin(jetonAcces)
  }

  public async obtenirStatutTotpSuperAdmin(
    jetonAcces: string
  ): Promise<DtoStatutTotpSuperAdmin> {
    return this.serviceTotpSuperAdminAuthentification.obtenirStatutTotpSuperAdmin(jetonAcces)
  }

  public async listerAuditsSecurite(
    jetonAcces: string,
    limite: number
  ): Promise<DtoListeAuditsSecurite> {
    return this.serviceAuditAuthentification.listerAuditsSecurite(jetonAcces, limite)
  }
}
