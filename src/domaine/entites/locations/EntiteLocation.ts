import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntiteCaution } from '@/src/domaine/entites/locations/EntiteCaution'
import { EntiteDocument } from '@/src/domaine/entites/locations/EntiteDocument'
import { EntitePaiementMensuel } from '@/src/domaine/entites/locations/EntitePaiementMensuel'
import {
  ObjetValeurIdentifiant,
  ObjetValeurMontant,
  ObjetValeurTexteNonVide,
} from '@/src/domaine/objets_valeur'
import { TypeBien } from '@/src/domaine/types/locations/TypeBien'

export class EntiteLocation extends ObjetDomaine {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public typeBien: TypeBien,
    public nomBien: string,
    public loyerMensuel: number,
    public dateDebut: Date,
    public caution: EntiteCaution = new EntiteCaution(0),
    public paiementsMensuels: EntitePaiementMensuel[] = [],
    public documents: EntiteDocument[] = []
  ) {
    super()
    new ObjetValeurIdentifiant(id)
    new ObjetValeurIdentifiant(clientId)
    this.nomBien = new ObjetValeurTexteNonVide(nomBien, 'nomBien', 200).valeur
    this.loyerMensuel = new ObjetValeurMontant(loyerMensuel).valeur
  }

  public aBienRenseigne(): boolean {
    const valeur = this.nomBien.trim().toLowerCase()
    return Boolean(valeur) && !['non renseigne', 'bien inconnu', 'n/a', 'na'].includes(valeur)
  }

  public ajouterDocument(document: EntiteDocument): void {
    this.documents.push(document)
  }

  public ajouterPaiementMensuel(paiement: EntitePaiementMensuel): void {
    this.paiementsMensuels.push(paiement)
  }
}
