import { randomUUID } from 'node:crypto'
import {
  InterfaceServiceAuditSecurite,
  TypeEntreeAuditSecurite,
} from '@/src/coeur/interfaces/InterfaceServiceAuditSecurite'
import { DaoAuthentificationMemoire } from '@/src/infrastructure/dao/memoire/authentification/DaoAuthentificationMemoire'

export class ServiceAuditSecuriteMemoire implements InterfaceServiceAuditSecurite {
  constructor(private readonly daoAuthentificationMemoire: DaoAuthentificationMemoire) {}

  public async enregistrer(entree: TypeEntreeAuditSecurite): Promise<void> {
    this.daoAuthentificationMemoire.ajouterAuditSecurite({
      id: randomUUID(),
      action: entree.action,
      statut: entree.statut,
      details: entree.details || null,
      adresseIp: entree.adresseIp || null,
      agentUtilisateur: entree.agentUtilisateur || null,
      creeLe: new Date(),
      utilisateurId: entree.utilisateurId || null,
    })
  }
}
