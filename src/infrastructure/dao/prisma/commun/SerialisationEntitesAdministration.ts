import { Prisma } from '@prisma/client'
import {
  BuilderEntiteCaution,
  BuilderEntiteClient,
  BuilderEntiteDocument,
  BuilderEntiteErreurImport,
  BuilderEntiteExecutionImport,
  BuilderEntiteIpBloquee,
  BuilderEntiteItemTravail,
  BuilderEntiteJournalAudit,
  BuilderEntiteContractTemplate,
  BuilderEntiteInventoryTemplate,
  BuilderEntiteContract,
  BuilderEntiteLocation,
  BuilderEntiteNotification,
  BuilderEntitePaiementAbonnementAdmin,
  BuilderEntitePaiementCaution,
  BuilderEntitePaiementMensuel,
  BuilderEntiteStatutAbonnementAdmin,
  BuilderEntiteTransactionPaiement,
} from '@/src/domaine/builders'
import {
  EntiteClient,
  EntiteDocument,
  EntiteExecutionImport,
  EntiteIpBloquee,
  EntiteItemTravail,
  EntiteJournalAudit,
  EntiteContractTemplate,
  EntiteContract,
  EntiteLocation,
  EntiteNotification,
  EntitePaiementAbonnementAdmin,
  EntitePaiementCaution,
  EntitePaiementMensuel,
  EntiteStatutAbonnementAdmin,
  EntiteTransactionPaiement,
} from '@/src/domaine/entites'
import { TypeStatutMouvement } from '@/src/domaine/types/administration'
import { TypeLigneImportee } from '@/src/domaine/types/systeme/TypeLigneImportee'

const texte = (valeur: unknown, defaut = ''): string => {
  const v = String(valeur ?? '').trim()
  return v || defaut
}

const texteOptionnel = (valeur: unknown): string | undefined => {
  const v = String(valeur ?? '').trim()
  return v || undefined
}

const nombre = (valeur: unknown, defaut = 0): number => {
  const n = Number(valeur)
  return Number.isFinite(n) ? n : defaut
}

const booleen = (valeur: unknown, defaut = false): boolean => {
  if (typeof valeur === 'boolean') return valeur
  if (typeof valeur === 'number') return valeur !== 0
  const normalise = String(valeur ?? '').trim().toLowerCase()
  if (normalise === 'true' || normalise === '1') return true
  if (normalise === 'false' || normalise === '0') return false
  return defaut
}

const date = (valeur: unknown, defaut = new Date()): Date => {
  if (valeur instanceof Date && !Number.isNaN(valeur.getTime())) return valeur
  const d = new Date(String(valeur ?? ''))
  return Number.isNaN(d.getTime()) ? defaut : d
}

const dateOptionnelle = (valeur: unknown): Date | null => {
  if (valeur === null || valeur === undefined || valeur === '') return null
  const d = new Date(String(valeur))
  return Number.isNaN(d.getTime()) ? null : d
}

const normaliserTypeBien = (valeur: unknown): 'studio' | 'room' | 'apartment' | 'villa' | 'other' => {
  const v = texte(valeur, 'other').toLowerCase()
  if (v === 'studio' || v === 'room' || v === 'apartment' || v === 'villa') return v
  return 'other'
}

const normaliserStatutClient = (valeur: unknown): 'active' | 'archived' | 'blacklisted' => {
  const v = texte(valeur, 'active').toLowerCase()
  if (v === 'active' || v === 'archived' || v === 'blacklisted') return v
  return 'active'
}

const normaliserTypeDocument = (valeur: unknown): 'contract' | 'receipt' | 'other' | 'etat_des_lieux' => {
  const v = texte(valeur, 'other').toLowerCase()
  if (v === 'contract' || v === 'receipt' || v === 'other' || v === 'etat_des_lieux') return v
  return 'other'
}

const normaliserStatutPaiementMensuel = (valeur: unknown): 'paid' | 'partial' | 'unpaid' | 'late' => {
  const v = texte(valeur, 'unpaid').toLowerCase()
  if (v === 'paid' || v === 'partial' || v === 'unpaid' || v === 'late') return v
  return 'unpaid'
}

const normaliserPriorite = (valeur: unknown): 'low' | 'medium' | 'high' => {
  const v = texte(valeur, 'medium').toLowerCase()
  if (v === 'low' || v === 'medium' || v === 'high') return v
  return 'medium'
}

const normaliserStatutTravail = (valeur: unknown): 'pending' | 'in-progress' | 'completed' => {
  const v = texte(valeur, 'pending').toLowerCase().replace('_', '-')
  if (v === 'pending' || v === 'in-progress' || v === 'completed') return v
  return 'pending'
}

const normaliserMethodePaiementAdmin = (valeur: unknown): 'wave' | 'orange_money' | 'cash' => {
  const v = texte(valeur, 'wave').toLowerCase()
  if (v === 'wave' || v === 'orange_money' || v === 'cash') return v
  return 'wave'
}

const normaliserStatutPaiementAdmin = (
  valeur: unknown
): 'pending' | 'paid' | 'failed' | 'cancelled' => {
  const v = texte(valeur, 'pending').toLowerCase()
  if (v === 'pending' || v === 'paid' || v === 'failed' || v === 'cancelled') return v
  return 'pending'
}

const normaliserModeAbonnement = (valeur: unknown): 'monthly' | 'premium' | 'annual' => {
  const v = texte(valeur, 'monthly').toLowerCase()
  if (v === 'monthly' || v === 'premium' || v === 'annual') return v
  return 'monthly'
}

const normaliserFournisseur = (valeur: unknown): 'stripe' | 'wave' | 'orange' | 'manual' => {
  const v = texte(valeur, 'manual').toLowerCase()
  if (v === 'stripe' || v === 'wave' || v === 'orange' || v === 'manual') return v
  return 'manual'
}

const normaliserStatutMouvement = (valeur: unknown): TypeStatutMouvement => {
  const v = texte(valeur, 'completed').toLowerCase()
  if (v === 'pending' || v === 'completed' || v === 'failed') return v
  return 'completed'
}

const normaliserStatutContrat = (valeur: unknown): 'pending_signature' | 'signed' | 'draft' => {
  const v = texte(valeur, 'pending_signature').toLowerCase()
  if (v === 'pending_signature' || v === 'signed' || v === 'draft') return v
  return 'pending_signature'
}

export type TypeLocationHydratee = {
  id: string
  typeBien: string
  nomBien: string
  loyerMensuel: number
  dateDebut: Date
  cautionMontantTotal: number
  cautionMontantPaye: number
  paiementsMensuels: Array<{
    id: string
    periodeDebut: Date
    periodeFin: Date
    dateEcheance: Date
    montantDu: number
    montantPaye: number
    statut: string
    transactions: Array<{
      id: string
      montant: number
      datePaiement: Date
      numeroRecu: string
      description: string | null
      statut: string
    }>
  }>
  documents: Array<{
    id: string
    nom: string
    type: string
    url: string
    dateAjout: Date
    estSigne: boolean
  }>
  depots: Array<{
    id: string
    montant: number
    datePaiement: Date
    numeroRecu: string
    note: string | null
    statut: string
  }>
}

export const mapperClientDepuisPrisma = (ligne: {
  id: string
  adminId: string
  prenom: string
  nom: string
  telephone: string
  cni: string
  email: string | null
  statut: string
  creeLe: Date
  locations: TypeLocationHydratee[]
}): EntiteClient => {
  const builder = new BuilderEntiteClient()
    .avecId(ligne.id)
    .avecPrenom(ligne.prenom)
    .avecNom(ligne.nom)
    .avecTelephone(ligne.telephone)
    .avecCni(ligne.cni)
    .avecAdminId(ligne.adminId)
    .avecStatut(normaliserStatutClient(ligne.statut))
    .avecDateCreation(ligne.creeLe)
    .avecLocations(ligne.locations.map((location) => mapperLocationDepuisPrisma(location, ligne.id)))

  if (ligne.email) {
    builder.avecEmail(ligne.email)
  }

  return builder.construire()
}

export const mapperLocationDepuisPrisma = (
  ligne: TypeLocationHydratee,
  clientId: string
): EntiteLocation => {
  return new BuilderEntiteLocation()
    .avecId(ligne.id)
    .avecClientId(clientId)
    .avecTypeBien(normaliserTypeBien(ligne.typeBien))
    .avecNomBien(ligne.nomBien)
    .avecLoyerMensuel(ligne.loyerMensuel)
    .avecDateDebut(ligne.dateDebut)
    .avecCaution(
      new BuilderEntiteCaution()
        .avecMontantTotal(ligne.cautionMontantTotal)
        .avecMontantPaye(ligne.cautionMontantPaye)
        .avecPaiements(ligne.depots.map(mapperPaiementCautionDepuisPrisma))
        .construire()
    )
    .avecPaiementsMensuels(
      ligne.paiementsMensuels.map((paiement) =>
        new BuilderEntitePaiementMensuel()
          .avecId(paiement.id)
          .avecLocationId(ligne.id)
          .avecPeriodeDebut(paiement.periodeDebut)
          .avecPeriodeFin(paiement.periodeFin)
          .avecDateEcheance(paiement.dateEcheance)
          .avecMontantDu(paiement.montantDu)
          .avecMontantPaye(paiement.montantPaye)
          .avecStatut(normaliserStatutPaiementMensuel(paiement.statut))
          .avecTransactions(paiement.transactions.map(mapperTransactionPaiementDepuisPrisma))
          .construire()
      )
    )
    .avecDocuments(ligne.documents.map(mapperDocumentDepuisPrisma))
    .construire()
}

export const mapperDocumentDepuisPrisma = (ligne: {
  id: string
  nom: string
  type: string
  url: string
  dateAjout: Date
  estSigne: boolean
  templateId?: string | null
  templateName?: string | null
  statut?: string | null
  items?: any | null
}): EntiteDocument =>
  new BuilderEntiteDocument()
    .avecId(ligne.id)
    .avecNom(ligne.nom)
    .avecType(normaliserTypeDocument(ligne.type))
    .avecUrl(ligne.url)
    .avecDateAjout(ligne.dateAjout)
    .avecEstSigne(ligne.estSigne)
    .avecTemplateId(ligne.templateId ?? null)
    .avecTemplateName(ligne.templateName ?? null)
    .avecStatut((ligne.statut as any) ?? null)
    .avecItems((ligne.items as any) ?? null)
    .construire()

export const mapperTransactionPaiementDepuisPrisma = (ligne: {
  id: string
  montant: number
  datePaiement: Date
  numeroRecu: string
  description: string | null
  statut: string
}): EntiteTransactionPaiement => {
  const entite = new BuilderEntiteTransactionPaiement()
    .avecId(ligne.id)
    .avecMontant(ligne.montant)
    .avecDatePaiement(ligne.datePaiement)
    .avecNumeroRecu(ligne.numeroRecu)
    .avecDescription(ligne.description || '')
    .construire()

  ;(entite as { statut?: TypeStatutMouvement }).statut = normaliserStatutMouvement(ligne.statut)
  return entite
}

export const mapperPaiementCautionDepuisPrisma = (ligne: {
  id: string
  montant: number
  datePaiement: Date
  numeroRecu: string
  note: string | null
  statut: string
}): EntitePaiementCaution => {
  const entite = new BuilderEntitePaiementCaution()
    .avecId(ligne.id)
    .avecMontant(ligne.montant)
    .avecDatePaiement(ligne.datePaiement)
    .avecNumeroRecu(ligne.numeroRecu)
    .avecNote(ligne.note || '')
    .construire()

  ;(entite as { statut?: TypeStatutMouvement }).statut = normaliserStatutMouvement(ligne.statut)
  return entite
}

export const mapperItemTravailDepuisPrisma = (ligne: {
  id: string
  titre: string
  description: string
  priorite: string
  statut: string
  dateEcheance: Date | null
  detecteAutomatiquement: boolean
  creeLe: Date
}): EntiteItemTravail => {
  const builder = new BuilderEntiteItemTravail()
    .avecId(ligne.id)
    .avecTitre(ligne.titre)
    .avecDescription(ligne.description)
    .avecPriorite(normaliserPriorite(ligne.priorite))
    .avecStatut(normaliserStatutTravail(ligne.statut))
    .avecDateCreation(ligne.creeLe)
    .avecDetecteAutomatiquement(ligne.detecteAutomatiquement)

  if (ligne.dateEcheance) {
    builder.avecDateEcheance(ligne.dateEcheance)
  }

  return builder.construire()
}

export const mapperExecutionImportDepuisPrisma = (ligne: {
  id: string
  adminId: string | null
  nomFichier: string | null
  nombreLignesTotal: number
  ignoree: boolean
  lectureReussie: boolean
  lectureAvecErreurs: boolean
  creeLe: Date
  misAJourLe: Date
  lignesInserees: Array<{
    id: string
    prenom: string
    nom: string
    telephone: string
    email: string | null
  }>
  erreurs: Array<{
    numeroLigne: number
    donneesBrutesTexte: string | null
    messages: Array<{ message: string }>
  }>
}): EntiteExecutionImport => {
  const inserted: TypeLigneImportee[] = ligne.lignesInserees.map((item) => ({
    id: item.id,
    prenom: item.prenom,
    nom: item.nom,
    telephone: item.telephone,
    email: item.email || undefined,
  }))

  const erreurs = ligne.erreurs.map((erreur) => {
    let donneesBrutes: Record<string, unknown> = {}
    if (erreur.donneesBrutesTexte) {
      try {
        const parsed = JSON.parse(erreur.donneesBrutesTexte)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          donneesBrutes = parsed as Record<string, unknown>
        }
      } catch {
        donneesBrutes = {}
      }
    }

    return new BuilderEntiteErreurImport()
      .avecNumeroLigne(erreur.numeroLigne)
      .avecErreurs(erreur.messages.map((item) => item.message))
      .avecDonneesBrutes(donneesBrutes)
      .construire()
  })

  const builder = new BuilderEntiteExecutionImport()
    .avecId(ligne.id)
    .avecNombreLignesTotal(ligne.nombreLignesTotal)
    .avecLignesInserees(inserted)
    .avecErreurs(erreurs)
    .avecIgnoree(ligne.ignoree)
    .avecLectureReussie(ligne.lectureReussie)
    .avecLectureAvecErreurs(ligne.lectureAvecErreurs)
    .avecDateCreation(ligne.creeLe)
    .avecDateMiseAJour(ligne.misAJourLe)

  if (ligne.adminId) builder.avecAdminId(ligne.adminId)
  if (ligne.nomFichier) builder.avecNomFichier(ligne.nomFichier)

  return builder.construire()
}

export const mapperNotificationDepuisPrisma = (ligne: {
  id: string
  utilisateurId: string
  message: string
  type: string | null
  estLue: boolean
  creeLe: Date
}): EntiteNotification => {
  const builder = new BuilderEntiteNotification()
    .avecId(ligne.id)
    .avecUtilisateurId(ligne.utilisateurId)
    .avecMessage(ligne.message)
    .avecEstLue(ligne.estLue)
    .avecDateCreation(ligne.creeLe)

  if (ligne.type) builder.avecType(ligne.type)
  return builder.construire()
}

export const mapperIpBloqueeDepuisPrisma = (ligne: {
  id: string
  adresseIp: string
  raison: string | null
  creeLe: Date
}): EntiteIpBloquee => {
  const builder = new BuilderEntiteIpBloquee()
    .avecId(ligne.id)
    .avecAdresseIp(ligne.adresseIp)
    .avecDateCreation(ligne.creeLe)

  if (ligne.raison) builder.avecRaison(ligne.raison)
  return builder.construire()
}

export const mapperJournalAuditDepuisPrisma = (ligne: {
  id: string
  acteur: string | null
  action: string | null
  typeCible: string | null
  idCible: string | null
  message: string | null
  adresseIp: string | null
  creeLe: Date
}): EntiteJournalAudit => {
  const builder = new BuilderEntiteJournalAudit()
    .avecId(ligne.id)
    .avecDateCreation(ligne.creeLe)

  if (ligne.acteur) builder.avecActeur(ligne.acteur)
  if (ligne.action) builder.avecAction(ligne.action)
  if (ligne.typeCible) builder.avecTypeCible(ligne.typeCible)
  if (ligne.idCible) builder.avecIdCible(ligne.idCible)
  if (ligne.message) builder.avecMessage(ligne.message)
  if (ligne.adresseIp) builder.avecAdresseIp(ligne.adresseIp)

  return builder.construire()
}

export const mapperPaiementAbonnementDepuisPrisma = (ligne: {
  id: string
  adminId: string
  montant: number
  methode: string
  mois: string
  entrepriseId: string | null
  statut: string
  fournisseur: string | null
  referenceFournisseur: string | null
  urlPaiement: string | null
  telephonePayeur: string | null
  referenceTransaction: string | null
  note: string | null
  payeLe: Date | null
  approuveLe: Date | null
  approuvePar: string | null
  modeAbonnement: string
  creeLe: Date
}): EntitePaiementAbonnementAdmin => {
  const builder = new BuilderEntitePaiementAbonnementAdmin()
    .avecId(ligne.id)
    .avecAdminId(ligne.adminId)
    .avecMontant(ligne.montant)
    .avecMethode(normaliserMethodePaiementAdmin(ligne.methode))
    .avecMois(ligne.mois)
    .avecStatut(normaliserStatutPaiementAdmin(ligne.statut))
    .avecFournisseur(normaliserFournisseur(ligne.fournisseur))
    .avecModeAbonnement(normaliserModeAbonnement(ligne.modeAbonnement))
    .avecDateCreation(ligne.creeLe)
    .avecPayeLe(ligne.payeLe)
    .avecApprouveLe(ligne.approuveLe)

  if (ligne.entrepriseId) builder.avecEntrepriseId(ligne.entrepriseId)
  if (ligne.referenceFournisseur) builder.avecReferenceFournisseur(ligne.referenceFournisseur)
  if (ligne.urlPaiement) builder.avecUrlPaiement(ligne.urlPaiement)
  if (ligne.telephonePayeur) builder.avecTelephonePayeur(ligne.telephonePayeur)
  if (ligne.referenceTransaction) builder.avecReferenceTransaction(ligne.referenceTransaction)
  if (ligne.note) builder.avecNote(ligne.note)
  if (ligne.approuvePar) builder.avecApprouvePar(ligne.approuvePar)

  return builder.construire()
}

export const mapperStatutAbonnementDepuisPrisma = (ligne: {
  adminId: string
  bloque: boolean
  moisEnRetard: string | null
  echeance: Date | null
  moisRequis: string
  moisCourant: string
  joursGrace: number
  modeAbonnement: string
  montantAttendu: number | null
  autoriserMontantLibre: boolean
}): EntiteStatutAbonnementAdmin => {
  const builder = new BuilderEntiteStatutAbonnementAdmin()
    .avecAdminId(ligne.adminId)
    .avecBloque(ligne.bloque)
    .avecMoisEnRetard(ligne.moisEnRetard)
    .avecEcheance(ligne.echeance)
    .avecMoisRequis(ligne.moisRequis)
    .avecMoisCourant(ligne.moisCourant)
    .avecJoursGrace(ligne.joursGrace)
    .avecModeAbonnement(normaliserModeAbonnement(ligne.modeAbonnement))
    .avecAutoriserMontantLibre(ligne.autoriserMontantLibre)

  if (typeof ligne.montantAttendu === 'number') {
    builder.avecMontantAttendu(ligne.montantAttendu)
  }

  return builder.construire()
}

export const mapperClientVersPrisma = (entite: EntiteClient) => ({
  id: entite.id,
  adminId: texte(entite.adminId),
  prenom: entite.prenom,
  nom: entite.nom,
  telephone: entite.telephone,
  cni: entite.cni,
  email: entite.email || null,
  statut: entite.statut,
  creeLe: entite.creeLe,
})

export const mapperLocationVersPrisma = (entite: EntiteLocation) => ({
  id: entite.id,
  clientId: entite.clientId,
  typeBien: entite.typeBien,
  nomBien: entite.nomBien,
  loyerMensuel: entite.loyerMensuel,
  dateDebut: entite.dateDebut,
  cautionMontantTotal: entite.caution.montantTotal,
  cautionMontantPaye: entite.caution.montantPaye,
})

export const mapperDocumentVersPrisma = (entite: EntiteDocument, locationId?: string | null) => ({
  id: entite.id,
  locationId: locationId || null,
  nom: entite.nom,
  type: entite.type,
  url: entite.url,
  dateAjout: entite.dateAjout,
  estSigne: entite.estSigne,
  templateId: entite.templateId,
  templateName: entite.templateName,
  statut: entite.statut,
  items: entite.items,
})

export const mapperPaiementMensuelVersPrisma = (entite: EntitePaiementMensuel) => ({
  id: entite.id,
  locationId: entite.locationId,
  periodeDebut: entite.periodeDebut,
  periodeFin: entite.periodeFin,
  dateEcheance: entite.dateEcheance,
  montantDu: entite.montantDu,
  montantPaye: entite.montantPaye,
  statut: entite.statut,
})

export const mapperTransactionPaiementVersPrisma = (
  entite: EntiteTransactionPaiement,
  paiementMensuelId?: string | null
) => ({
  id: entite.id,
  paiementMensuelId: paiementMensuelId || null,
  montant: entite.montant,
  datePaiement: entite.datePaiement,
  numeroRecu: entite.numeroRecu,
  description: entite.description || null,
  statut: normaliserStatutMouvement((entite as { statut?: string }).statut),
})

export const mapperPaiementCautionVersPrisma = (
  entite: EntitePaiementCaution,
  locationId?: string | null
) => ({
  id: entite.id,
  locationId: locationId || null,
  montant: entite.montant,
  datePaiement: entite.datePaiement,
  numeroRecu: entite.numeroRecu,
  note: entite.note || null,
  statut: normaliserStatutMouvement((entite as { statut?: string }).statut),
})

export const mapperItemTravailVersPrisma = (entite: EntiteItemTravail) => ({
  id: entite.id,
  titre: entite.titre,
  description: entite.description,
  priorite: entite.priorite,
  statut: entite.statut,
  dateEcheance: entite.dateEcheance || null,
  detecteAutomatiquement: entite.detecteAutomatiquement,
  creeLe: entite.creeLe,
})

export const mapperExecutionImportVersPrisma = (entite: EntiteExecutionImport) => ({
  id: entite.id,
  adminId: entite.adminId || null,
  nomFichier: entite.nomFichier || null,
  nombreLignesTotal: entite.nombreLignesTotal,
  ignoree: entite.ignoree,
  lectureReussie: entite.lectureReussie,
  lectureAvecErreurs: entite.lectureAvecErreurs,
  creeLe: entite.creeLe,
  misAJourLe: entite.misAJourLe,
})

export const mapperNotificationVersPrisma = (entite: EntiteNotification) => ({
  id: entite.id,
  utilisateurId: entite.utilisateurId,
  message: entite.message,
  type: entite.type || null,
  estLue: entite.estLue,
  creeLe: entite.creeLe,
})

export const mapperIpBloqueeVersPrisma = (entite: EntiteIpBloquee) => ({
  id: entite.id,
  adresseIp: entite.adresseIp,
  raison: entite.raison || null,
  creeLe: entite.creeLe,
})

export const mapperJournalAuditVersPrisma = (entite: EntiteJournalAudit) => ({
  id: entite.id,
  acteur: entite.acteur || null,
  action: entite.action || null,
  typeCible: entite.typeCible || null,
  idCible: entite.idCible || null,
  message: entite.message || null,
  adresseIp: entite.adresseIp || null,
  creeLe: entite.creeLe,
})

export const mapperPaiementAbonnementVersPrisma = (entite: EntitePaiementAbonnementAdmin) => ({
  id: entite.id,
  adminId: entite.adminId,
  montant: entite.montant,
  methode: entite.methode,
  mois: entite.mois,
  entrepriseId: entite.entrepriseId || null,
  statut: entite.statut,
  fournisseur: entite.fournisseur || null,
  referenceFournisseur: entite.referenceFournisseur || null,
  urlPaiement: entite.urlPaiement || null,
  telephonePayeur: entite.telephonePayeur || null,
  referenceTransaction: entite.referenceTransaction || null,
  note: entite.note || null,
  payeLe: entite.payeLe || null,
  approuveLe: entite.approuveLe || null,
  approuvePar: entite.approuvePar || null,
  modeAbonnement: entite.modeAbonnement,
  creeLe: entite.creeLe,
})

export const mapperStatutAbonnementVersPrisma = (entite: EntiteStatutAbonnementAdmin) => ({
  adminId: entite.adminId,
  bloque: entite.bloque,
  moisEnRetard: entite.moisEnRetard || null,
  echeance: entite.echeance || null,
  moisRequis: entite.moisRequis,
  moisCourant: entite.moisCourant,
  joursGrace: entite.joursGrace,
  modeAbonnement: entite.modeAbonnement,
  montantAttendu: typeof entite.montantAttendu === 'number' ? entite.montantAttendu : null,
  autoriserMontantLibre: entite.autoriserMontantLibre,
})

export const mapperContractTemplateDepuisPrisma = (row: {
  id: string
  adminId: string
  nom: string
  corps: string
  placeholders: unknown
  version: number
  creeLe: Date
  misAJourLe: Date
}): EntiteContractTemplate => {
  return new BuilderEntiteContractTemplate()
    .avecId(row.id)
    .avecAdminId(row.adminId)
    .avecNom(row.nom)
    .avecCorps(row.corps)
    .avecPlaceholders((row.placeholders as Record<string, unknown> | null) || null)
    .avecVersion(row.version)
    .avecCreeLe(row.creeLe)
    .avecMisAJourLe(row.misAJourLe)
    .build()
}

export const mapperContractTemplateVersPrisma = (entite: EntiteContractTemplate) => ({
  id: entite.id,
  adminId: entite.adminId,
  nom: entite.nom,
  corps: entite.corps,
  placeholders:
    entite.placeholders === null
      ? Prisma.JsonNull
      : (entite.placeholders as Prisma.InputJsonValue),
  version: entite.version,
  creeLe: entite.creeLe,
  misAJourLe: entite.misAJourLe,
})

export const mapperInventoryTemplateDepuisPrisma = (row: {
  id: string
  adminId: string
  nom: string
  corps: string
  placeholders: unknown
  isTable: boolean
  version: number
  creeLe: Date
  misAJourLe: Date
}) =>
  new BuilderEntiteInventoryTemplate()
    .avecId(row.id)
    .avecAdminId(row.adminId)
    .avecNom(row.nom)
    .avecCorps(row.corps)
    .avecPlaceholders((row.placeholders as Record<string, unknown> | null) || null)
    .avecIsTable(row.isTable)
    .avecVersion(row.version)
    .avecCreeLe(row.creeLe)
    .avecMisAJourLe(row.misAJourLe)
    .build()

export const mapperInventoryTemplateVersPrisma = (entite: any) => ({
  id: entite.id,
  adminId: entite.adminId,
  nom: entite.nom,
  corps: entite.corps,
  placeholders:
    entite.placeholders === null ? Prisma.JsonNull : (entite.placeholders as Prisma.InputJsonValue),
  isTable: entite.isTable,
  version: entite.version,
  creeLe: entite.creeLe,
  misAJourLe: entite.misAJourLe,
})

export const mapperContractDepuisPrisma = (row: {
  id: string
  adminId: string
  clientId: string
  locationId: string | null
  templateId: string | null
  statut: string
  pdfUrl: string | null
  payload: unknown
  hashContenu: string | null
  signeLe: Date | null
  creeLe: Date
  misAJourLe: Date
}): EntiteContract => {
  return new BuilderEntiteContract()
    .avecId(row.id)
    .avecAdminId(row.adminId)
    .avecClientId(row.clientId)
    .avecLocationId(row.locationId)
    .avecTemplateId(row.templateId)
    .avecStatut(normaliserStatutContrat(row.statut))
    .avecPdfUrl(row.pdfUrl)
    .avecPayload((row.payload as Record<string, unknown> | null) || null)
    .avecHashContenu(row.hashContenu)
    .avecSigneLe(row.signeLe)
    .avecCreeLe(row.creeLe)
    .avecMisAJourLe(row.misAJourLe)
    .build()
}

export const mapperContractVersPrisma = (entite: EntiteContract) => ({
  id: entite.id,
  adminId: entite.adminId,
  clientId: entite.clientId,
  locationId: entite.locationId,
  templateId: entite.templateId,
  statut: entite.statut,
  pdfUrl: entite.pdfUrl,
  payload:
    entite.payload === null ? Prisma.JsonNull : (entite.payload as Prisma.InputJsonValue),
  hashContenu: entite.hashContenu,
  signeLe: entite.signeLe,
  creeLe: entite.creeLe,
  misAJourLe: entite.misAJourLe,
})

export const parserDonneesBrutesErreur = (texteBrute?: string | null): Record<string, unknown> => {
  if (!texteBrute) return {}
  try {
    const parsee = JSON.parse(texteBrute)
    if (parsee && typeof parsee === 'object' && !Array.isArray(parsee)) {
      return parsee as Record<string, unknown>
    }
  } catch {
    return {}
  }
  return {}
}

export const serialiserDonneesBrutesErreur = (valeur: Record<string, unknown>): string => {
  try {
    return JSON.stringify(valeur || {})
  } catch {
    return '{}'
  }
}
