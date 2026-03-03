import { EntiteDocument } from '@/src/domaine/entites/locations/EntiteDocument'
import { EntiteErreurImport } from '@/src/domaine/entites/systeme/EntiteErreurImport'
import { EntiteExecutionImport } from '@/src/domaine/entites/systeme/EntiteExecutionImport'
import { EntiteIpBloquee } from '@/src/domaine/entites/systeme/EntiteIpBloquee'
import { EntiteItemTravail } from '@/src/domaine/entites/systeme/EntiteItemTravail'
import { EntiteJournalAudit } from '@/src/domaine/entites/systeme/EntiteJournalAudit'
import { EntiteNotification } from '@/src/domaine/entites/systeme/EntiteNotification'

export interface DtoDocument {
  donnees: EntiteDocument
}

export interface DtoErreurImport {
  donnees: EntiteErreurImport
}

export interface DtoExecutionImport {
  donnees: EntiteExecutionImport
}

export interface DtoIpBloquee {
  donnees: EntiteIpBloquee
}

export interface DtoItemTravail {
  donnees: EntiteItemTravail
}

export interface DtoJournalAudit {
  donnees: EntiteJournalAudit
}

export interface DtoNotification {
  donnees: EntiteNotification
}
