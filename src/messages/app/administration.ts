import { TypeRessourceAdministrationAdmin } from '@/src/domaine/types/administration'

export const CODES_PERMISSIONS_RESSOURCES_ADMIN: Record<
  TypeRessourceAdministrationAdmin,
  string | null
> = {
  admins: null,
  admin_requests: null,
  entreprises: null,
  users: null,
  clients: 'CLIENTS_GERER',
  locations: 'LOCATIONS_GERER',
  documents: 'DOCUMENTS_GERER',
  payments: 'PAIEMENTS_GERER',
  deposits: 'PAIEMENTS_GERER',
  work_items: 'TRAVAUX_GERER',
  settings: 'PARAMETRES_GERER',
  import_runs: 'IMPORTS_GERER',
  notifications: 'NOTIFICATIONS_GERER',
  'undo-actions': 'PARAMETRES_GERER',
  admin_payments: 'PAIEMENTS_GERER',
  audit_logs: 'PARAMETRES_GERER',
  blocked_ips: 'PARAMETRES_GERER',
  cloudinary: 'DOCUMENTS_GERER',
}

export const DUREE_ANNULATION_MILLISECONDES = 60 * 24 * 60 * 60 * 1000
