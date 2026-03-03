import { randomUUID } from 'node:crypto'
import { BuilderEntiteJetonRefresh } from '@/src/domaine/builders/authentification/BuilderEntiteJetonRefresh'
import { EntiteJetonRefresh } from '@/src/domaine/entites/authentification/EntiteJetonRefresh'
import { EntiteSessionAuthentification } from '@/src/domaine/entites/authentification/EntiteSessionAuthentification'

export class FabriqueJetonRefresh {
  public creerNouveauJeton(entree: {
    session: EntiteSessionAuthentification
    hachageToken: string
    expireLe: Date
    id?: string
  }): EntiteJetonRefresh {
    return new BuilderEntiteJetonRefresh()
      .avecId(entree.id || randomUUID())
      .avecSession(entree.session)
      .avecSessionId(entree.session.id)
      .avecHachageToken(entree.hachageToken)
      .avecExpireLe(entree.expireLe)
      .avecUtiliseLe(null)
      .avecRevoqueLe(null)
      .avecRemplaceParId(null)
      .construire()
  }
}
