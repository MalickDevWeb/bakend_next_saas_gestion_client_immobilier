type TypeUtilisateurAuthentifieBrut = {
  id: string
  telephone?: string
  email?: string
  role?: string
  statut?: string
  permissions?: unknown
  superAdminSecondAuthRequired?: boolean
}

type TypePermissionsFonctionnellesAdmin = {
  dashboard: boolean
  clients: boolean
  rentals: boolean
  payments: boolean
  documents: boolean
  settings: boolean
  work: boolean
  imports: boolean
  notifications: boolean
  pdfExport: boolean
}

const PERMISSIONS_TOUT_ACTIF: TypePermissionsFonctionnellesAdmin = {
  dashboard: true,
  clients: true,
  rentals: true,
  payments: true,
  documents: true,
  settings: true,
  work: true,
  imports: true,
  notifications: true,
  pdfExport: true,
}

const CODES_PERMISSIONS_FONCTIONNELLES: Array<{
  code: string
  cle: keyof TypePermissionsFonctionnellesAdmin
}> = [
  { code: 'DASHBOARD_ACCEDER', cle: 'dashboard' },
  { code: 'CLIENTS_GERER', cle: 'clients' },
  { code: 'LOCATIONS_GERER', cle: 'rentals' },
  { code: 'PAIEMENTS_GERER', cle: 'payments' },
  { code: 'DOCUMENTS_GERER', cle: 'documents' },
  { code: 'PARAMETRES_GERER', cle: 'settings' },
  { code: 'TRAVAUX_GERER', cle: 'work' },
  { code: 'IMPORTS_GERER', cle: 'imports' },
  { code: 'NOTIFICATIONS_GERER', cle: 'notifications' },
  { code: 'PDF_EXPORTER', cle: 'pdfExport' },
]

function extraireCodesPermissions(brut: unknown): string[] {
  if (!Array.isArray(brut)) return []
  return brut
    .map((code) => String(code || '').trim())
    .filter(Boolean)
}

function mapperCodesVersPermissionsFonctionnelles(
  role: string,
  codes: string[]
): TypePermissionsFonctionnellesAdmin {
  if (role === 'SUPER_ADMIN') return { ...PERMISSIONS_TOUT_ACTIF }

  const permissions: TypePermissionsFonctionnellesAdmin = {
    dashboard: false,
    clients: false,
    rentals: false,
    payments: false,
    documents: false,
    settings: false,
    work: false,
    imports: false,
    notifications: false,
    pdfExport: false,
  }

  const ensemble = new Set(codes)
  for (const mapping of CODES_PERMISSIONS_FONCTIONNELLES) {
    permissions[mapping.cle] = ensemble.has(mapping.code)
  }

  return permissions
}

export function adapterUtilisateurAuthentifieFrontend(
  utilisateur: TypeUtilisateurAuthentifieBrut | null | undefined
): Record<string, unknown> | null {
  if (!utilisateur) return null

  const role = String(utilisateur.role || '').toUpperCase()
  const codesPermissions = extraireCodesPermissions(utilisateur.permissions)
  const username = String(utilisateur.telephone || '').trim()
  const name = username || (role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin')

  return {
    id: utilisateur.id,
    username,
    name,
    email: String(utilisateur.email || '').trim(),
    role,
    status: String(utilisateur.statut || '').toUpperCase(),
    superAdminSecondAuthRequired: Boolean(utilisateur.superAdminSecondAuthRequired),
    permissions: mapperCodesVersPermissionsFonctionnelles(role, codesPermissions),
    permissionCodes: codesPermissions,
    telephone: username,
    statut: String(utilisateur.statut || '').toUpperCase(),
  }
}
