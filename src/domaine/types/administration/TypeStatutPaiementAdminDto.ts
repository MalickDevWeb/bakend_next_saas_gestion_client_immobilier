export type TypeStatutPaiementAdminDto = {
  adminId: string
  bloque: boolean
  moisEnRetard: string | null
  echeance: Date | null
  moisRequis: string
  moisCourant: string
  joursGrace: number
  modeAbonnement: string
  montantAttendu?: number
  autoriserMontantLibre: boolean
}
