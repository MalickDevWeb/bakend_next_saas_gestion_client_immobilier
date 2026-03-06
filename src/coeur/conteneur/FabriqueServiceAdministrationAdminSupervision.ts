import { PrismaClient } from '@prisma/client'
import { MappeurAdministrationSupervision } from '@/src/application/mappers'
import { ServiceAdministrationAdminAnnulation } from '@/src/application/services/administration/commun/ServiceAdministrationAdminAnnulation'
import { ServiceAdministrationAdminSecurite } from '@/src/application/services/administration/commun/ServiceAdministrationAdminSecurite'
import { ServiceAdministrationAdminConstructeursSupervision } from '@/src/application/services/administration/constructeurs/ServiceAdministrationAdminConstructeursSupervision'
import { ServiceAdministrationAdminSupervision } from '@/src/application/services/administration/supervision/ServiceAdministrationAdminSupervision'
import {
  DaoAdminMemoire,
  DaoDemandeAdminMemoire,
  DaoEntrepriseMemoire,
} from '@/src/infrastructure/dao/memoire/administration'
import { DaoUtilisateurMemoire } from '@/src/infrastructure/dao/memoire/utilisateurs/DaoUtilisateurMemoire'
import {
  DaoAdminPrisma,
  DaoDemandeAdminPrisma,
  DaoEntreprisePrisma,
} from '@/src/infrastructure/dao/prisma/administration'
import { DaoUtilisateurPrisma } from '@/src/infrastructure/dao/prisma/utilisateurs'
import { ServiceAuthentification } from '@/src/application/services/authentification/ServiceAuthentification'
import { InterfaceServiceHachageMotDePasse } from '@/src/coeur/interfaces/InterfaceServiceHachageMotDePasse'
import { ServiceEvenementsNotification } from '@/src/infrastructure/alertes/ServiceEvenementsNotification'

type TypeParametresFabriqueServiceAdministrationAdminSupervision = {
  utiliseMemoire: boolean
  prisma: PrismaClient
  serviceAuthentification: ServiceAuthentification
  serviceHachageMotDePasse: InterfaceServiceHachageMotDePasse
  serviceEvenementsNotification: ServiceEvenementsNotification
}

export function creerServiceAdministrationAdminSupervision({
  utiliseMemoire,
  prisma,
  serviceAuthentification,
  serviceHachageMotDePasse,
  serviceEvenementsNotification,
}: TypeParametresFabriqueServiceAdministrationAdminSupervision): ServiceAdministrationAdminSupervision {
  const securite = new ServiceAdministrationAdminSecurite(serviceAuthentification)
  const annulation = new ServiceAdministrationAdminAnnulation()
  const constructeur = new ServiceAdministrationAdminConstructeursSupervision()
  const mappeur = new MappeurAdministrationSupervision()

  const daoAdmin = utiliseMemoire ? new DaoAdminMemoire() : new DaoAdminPrisma(prisma)
  const daoDemandeAdmin = utiliseMemoire
    ? new DaoDemandeAdminMemoire()
    : new DaoDemandeAdminPrisma(prisma)
  const daoEntreprise = utiliseMemoire
    ? new DaoEntrepriseMemoire()
    : new DaoEntreprisePrisma(prisma)
  const daoUtilisateur = utiliseMemoire
    ? new DaoUtilisateurMemoire()
    : new DaoUtilisateurPrisma(prisma)

  return new ServiceAdministrationAdminSupervision({
    securite,
    annulation,
    daoAdmin,
    daoDemandeAdmin,
    daoEntreprise,
    daoUtilisateur,
    serviceHachageMotDePasse,
    serviceEvenementsNotification,
    constructeur,
    mappeur,
  })
}
