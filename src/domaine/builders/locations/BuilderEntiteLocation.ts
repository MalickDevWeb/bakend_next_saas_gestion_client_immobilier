import { randomUUID } from 'node:crypto'
import { BuilderAbstrait } from '@/src/domaine/builders/BuilderAbstrait'
import { BuilderEntiteCaution } from '@/src/domaine/builders/locations/BuilderEntiteCaution'
import { EntiteCaution } from '@/src/domaine/entites/locations/EntiteCaution'
import { EntiteDocument } from '@/src/domaine/entites/locations/EntiteDocument'
import { EntiteLocation } from '@/src/domaine/entites/locations/EntiteLocation'
import { EntitePaiementMensuel } from '@/src/domaine/entites/locations/EntitePaiementMensuel'
import { TypeBien } from '@/src/domaine/types/locations/TypeBien'

export class BuilderEntiteLocation extends BuilderAbstrait<EntiteLocation> {
  private id?: string
  private clientId?: string
  private typeBien: TypeBien = 'other'
  private nomBien?: string
  private loyerMensuel = 0
  private dateDebut?: Date
  private caution: EntiteCaution = new BuilderEntiteCaution().construire()
  private paiementsMensuels: EntitePaiementMensuel[] = []
  private documents: EntiteDocument[] = []

  public avecId(valeur: string): this { this.id = valeur; return this }
  public avecClientId(valeur: string): this { this.clientId = valeur; return this }
  public avecTypeBien(valeur: TypeBien): this { this.typeBien = valeur; return this }
  public avecNomBien(valeur: string): this { this.nomBien = valeur; return this }
  public avecLoyerMensuel(valeur: number): this { this.loyerMensuel = valeur; return this }
  public avecDateDebut(valeur: Date): this { this.dateDebut = valeur; return this }
  public avecCaution(valeur: EntiteCaution): this { this.caution = valeur; return this }
  public avecPaiementsMensuels(valeur: EntitePaiementMensuel[]): this { this.paiementsMensuels = valeur; return this }
  public avecDocuments(valeur: EntiteDocument[]): this { this.documents = valeur; return this }

  public construire(): EntiteLocation {
    const id = this.id ? this.exigerIdentifiant(this.id, 'id') : randomUUID()
    const clientId = this.exigerIdentifiant(this.clientId, 'clientId')
    const nomBien = this.exigerTexte(this.nomBien, 'nomBien')
    const loyerMensuel = this.montantNonNegatif(this.loyerMensuel, 'loyerMensuel')

    return new EntiteLocation(
      id,
      clientId,
      this.typeBien,
      nomBien,
      loyerMensuel,
      this.dateOuMaintenant(this.dateDebut),
      this.caution,
      this.paiementsMensuels,
      this.documents
    )
  }
}
