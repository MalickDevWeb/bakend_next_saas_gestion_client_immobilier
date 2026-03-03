import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import {
  ObjetValeurAdresseIp,
  ObjetValeurAgentUtilisateur,
  ObjetValeurIdentifiant,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'

export class EntiteAuditSecuriteAuthentification extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public readonly action: string,
    public readonly statut: string,
    public readonly details: string | null,
    public readonly adresseIp: string | null,
    public readonly agentUtilisateur: string | null,
    public readonly creeLe: Date,
    public readonly utilisateurId: string | null
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    new ObjetValeurTexteNonVide(action, 'action', 150)
    new ObjetValeurTexteNonVide(statut, 'statut', 50)
    if (adresseIp) new ObjetValeurAdresseIp(adresseIp)
    if (agentUtilisateur) new ObjetValeurAgentUtilisateur(agentUtilisateur)
    if (utilisateurId) new ObjetValeurIdentifiant(utilisateurId)
  }
}
