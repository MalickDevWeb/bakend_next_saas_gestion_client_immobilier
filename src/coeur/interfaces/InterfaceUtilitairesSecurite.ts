import { NextRequest } from 'next/server'

export interface InterfaceUtilitairesSecurite {
  tokenAleatoire(taille?: number): string
  hachageSha256(valeur: string): string
  extraireAdresseIp(requete: NextRequest): string
  extraireAgentUtilisateur(requete: NextRequest): string
}
