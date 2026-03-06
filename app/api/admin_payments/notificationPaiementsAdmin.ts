import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { lirePolitiquePlateforme } from '@/src/infrastructure/http/politiquePlateforme'

const CLE_APP_NAME_BRANDING = 'admin_branding_app_name'
const CLE_LOGO_BRANDING = 'admin_branding_logo_url'

function normaliserTexte(valeur: unknown): string {
  return String(valeur || '').trim()
}

function normaliserEmail(valeur: unknown): string | null {
  const email = normaliserTexte(valeur)
  if (!email) return null
  const formatValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  return formatValide ? email : null
}

function normaliserLogoPublique(valeur: unknown): string | null {
  const url = normaliserTexte(valeur)
  if (!url) return null
  if (!/^https?:\/\//i.test(url)) return null
  return url
}

function lireNombre(valeur: unknown): number | null {
  const nombre = Number(valeur)
  if (!Number.isFinite(nombre)) return null
  return Number(nombre.toFixed(2))
}

type TypeContexteNotificationPaiement = {
  adminName: string | null
  adminEmail: string | null
  companyName: string | null
  logoUrl: string | null
  appName: string
}

export function estPaiementAbonnementFinalise(donnees: Record<string, unknown>): boolean {
  const statut = normaliserTexte(donnees.status).toUpperCase()
  if (['PAID', 'APPROVED', 'SUCCESS', 'COMPLETED'].includes(statut)) return true
  if (normaliserTexte(donnees.paidAt)) return true
  if (normaliserTexte(donnees.approvedAt)) return true
  return false
}

async function chargerContexteNotificationPaiement(
  adminId: string,
  entrepriseIdFallback: string | null
): Promise<TypeContexteNotificationPaiement> {
  const [admin, politique] = await Promise.all([
    adminId
      ? conteneurDependances.prisma.admin.findUnique({
          where: { id: adminId },
          select: { id: true, nom: true, email: true, entrepriseId: true },
        })
      : Promise.resolve(null),
    lirePolitiquePlateforme(conteneurDependances.prisma).catch(() => null),
  ])

  const entrepriseId = normaliserTexte(admin?.entrepriseId || entrepriseIdFallback) || null
  const [entreprise, branding] = await Promise.all([
    entrepriseId
      ? conteneurDependances.prisma.entreprise.findUnique({
          where: { id: entrepriseId },
          select: { id: true, nom: true },
        })
      : Promise.resolve(null),
    adminId
      ? conteneurDependances.prisma.parametreAdmin.findMany({
          where: {
            adminId,
            cle: {
              in: [
                `${CLE_APP_NAME_BRANDING}:${adminId}`,
                `${CLE_LOGO_BRANDING}:${adminId}`,
              ],
            },
          },
          select: { cle: true, valeur: true },
        })
      : Promise.resolve([] as Array<{ cle: string; valeur: string }>),
  ])

  const appNameParDefaut = normaliserTexte(politique?.branding.appName) || 'Keur Ya Aicha'
  const logoParDefaut = normaliserLogoPublique(politique?.branding.logoUrl)
  const appName = normaliserTexte(
    branding.find((item) => item.cle === `${CLE_APP_NAME_BRANDING}:${adminId}`)?.valeur
  )
  const logo = normaliserLogoPublique(
    branding.find((item) => item.cle === `${CLE_LOGO_BRANDING}:${adminId}`)?.valeur
  )

  return {
    adminName: normaliserTexte(admin?.nom) || null,
    adminEmail: normaliserEmail(admin?.email),
    companyName: normaliserTexte(entreprise?.nom) || null,
    logoUrl: logo || logoParDefaut,
    appName: appName || appNameParDefaut,
  }
}

export async function publierEvenementPaiementAbonnementAdminSuperAdmin(
  donnees: Record<string, unknown>
): Promise<void> {
  const adminId = normaliserTexte(donnees.adminId)
  const entrepriseId = normaliserTexte(donnees.entrepriseId) || null
  const contexte = await chargerContexteNotificationPaiement(adminId, entrepriseId)

  await conteneurDependances.serviceEvenementsNotification.publier({
    code: 'ADMIN_SUBSCRIPTION_PAYMENT_RECORDED',
    titre: 'Paiement abonnement admin enregistre',
    message: 'Un paiement d abonnement admin a ete enregistre.',
    severite: 'info',
    rolesDestinataires: ['SUPER_ADMIN'],
    details: {
      adminId: adminId || null,
      adminName: contexte.adminName,
      adminEmail: contexte.adminEmail,
      entrepriseId,
      companyName: contexte.companyName,
      appName: contexte.appName,
      logoUrl: contexte.logoUrl,
      amount: lireNombre(donnees.amount ?? donnees.montant),
      month: normaliserTexte(donnees.month ?? donnees.mois) || null,
      method: normaliserTexte(donnees.method ?? donnees.methode) || null,
      status: normaliserTexte(donnees.status ?? donnees.statut) || null,
      provider: normaliserTexte(donnees.provider ?? donnees.fournisseur) || null,
      providerReference: normaliserTexte(
        donnees.providerReference ?? donnees.referenceFournisseur
      ) || null,
      transactionRef: normaliserTexte(
        donnees.transactionRef ?? donnees.referenceTransaction
      ) || null,
      payerPhone: normaliserTexte(donnees.payerPhone ?? donnees.telephonePayeur) || null,
      checkoutUrl: normaliserTexte(donnees.checkoutUrl ?? donnees.urlPaiement) || null,
      paidAt: normaliserTexte(donnees.paidAt ?? donnees.payeLe) || null,
      approvedAt: normaliserTexte(donnees.approvedAt ?? donnees.approuveLe) || null,
      approvedBy: normaliserTexte(donnees.approvedBy ?? donnees.approuvePar) || null,
      note: normaliserTexte(donnees.note) || null,
      createdAt: normaliserTexte(donnees.createdAt ?? donnees.creeLe) || null,
    },
    tags: ['kya', 'admin-payment', 'subscription'],
  })
}
