import { EntiteJetonRefresh } from '@/src/domaine/entites/authentification/EntiteJetonRefresh'
import { EntiteSessionAuthentification } from '@/src/domaine/entites/authentification/EntiteSessionAuthentification'

export type TypeCommandeCreationSessionAuthentification = {
  session: EntiteSessionAuthentification
  jetonRefresh: EntiteJetonRefresh
}
