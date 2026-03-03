import { ObjetDomaine } from '@/src/domaine/entites/ObjetDomaine'
import { EntiteCaution } from '@/src/domaine/entites/EntiteCaution'
import { EntiteDocument } from '@/src/domaine/entites/EntiteDocument'
import { EntitePaiementMensuel } from '@/src/domaine/entites/EntitePaiementMensuel'
import { TypeBien } from '@/src/domaine/types/TypeBien'

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
