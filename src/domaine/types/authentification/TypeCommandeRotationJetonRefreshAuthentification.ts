import { EntiteJetonRefresh } from '@/src/domaine/entites/authentification/EntiteJetonRefresh'
import { EntiteSessionAuthentification } from '@/src/domaine/entites/authentification/EntiteSessionAuthentification'

export type TypeCommandeRotationJetonRefreshAuthentification = {
  session: EntiteSessionAuthentification
  jetonRefreshActuelId: string
  nouveauJetonRefresh: EntiteJetonRefresh
  dateRotation: Date
}
