import { EntiteCaution } from '@/src/domaine/entites/locations/EntiteCaution'
import { EntiteClient } from '@/src/domaine/entites/locations/EntiteClient'
import { EntiteEntreprise } from '@/src/domaine/entites/administration/EntiteEntreprise'
import { EntiteLocation } from '@/src/domaine/entites/locations/EntiteLocation'
import { EntitePaiementAbonnementAdmin } from '@/src/domaine/entites/administration/EntitePaiementAbonnementAdmin'
import { EntitePaiementCaution } from '@/src/domaine/entites/locations/EntitePaiementCaution'
import { EntitePaiementMensuel } from '@/src/domaine/entites/locations/EntitePaiementMensuel'
import { EntiteTransactionPaiement } from '@/src/domaine/entites/locations/EntiteTransactionPaiement'

export interface DtoClient {
  donnees: EntiteClient
}

export interface DtoEntreprise {
  donnees: EntiteEntreprise
}

export interface DtoLocation {
  donnees: EntiteLocation
}

export interface DtoCaution {
  donnees: EntiteCaution
}

export interface DtoPaiementMensuel {
  donnees: EntitePaiementMensuel
}

export interface DtoPaiementCaution {
  donnees: EntitePaiementCaution
}

export interface DtoPaiementAbonnementAdmin {
  donnees: EntitePaiementAbonnementAdmin
}

export interface DtoTransactionPaiement {
  donnees: EntiteTransactionPaiement
}
