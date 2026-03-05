function normaliserTelephoneSenegal(valeur) {
  const brut = String(valeur || '').trim()
  if (!brut) return ''
  const compact = brut.replace(/[\s-]+/g, '')
  if (compact.startsWith('+')) {
    const nettoye = `+${compact.slice(1).replace(/\D/g, '')}`
    return /^(\+2217\d{8})$/.test(nettoye) ? nettoye : ''
  }
  const nettoye = compact.replace(/\D/g, '')
  return /^(7\d{8})$/.test(nettoye) ? nettoye : ''
}

function choisirTelephone(...candidats) {
  for (const candidat of candidats) {
    const telephone = normaliserTelephoneSenegal(candidat)
    if (telephone) return telephone
  }
  return '771234567'
}

export const DONNEES_SECURITE_AUTH = {
  superAdmin: {
    telephone: choisirTelephone(process.env.SEED_SUPER_ADMIN_TELEPHONE, '771234567'),
    email: process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@kya.local',
    motDePasse: process.env.SEED_SUPER_ADMIN_MOT_DE_PASSE || 'SuperAdmin@123456',
    statut: 'ACTIF',
    totpActif: false,
  },
  admin: {
    telephone: choisirTelephone(process.env.SEED_ADMIN_TELEPHONE, '771234568'),
    email: process.env.SEED_ADMIN_EMAIL || 'admin@kya.local',
    motDePasse: process.env.SEED_ADMIN_MOT_DE_PASSE || 'Admin@123456',
    statut: 'ACTIF',
    totpActif: false,
  },
  permissionsSuperAdmin: [
    'AUTH_GERER',
    'AUDIT_LIRE',
    'AUDIT_EXPORTER',
    'CONFIGURATION_GERER',
    'ADMINS_GERER',
    'ENTREPRISES_GERER',
    'UTILISATEURS_GERER',
    'SECURITE_GERER',
  ],
  permissionsAdmin: [
    // Preset frontend adminPermissions.ts (dashboard, clients, rentals, ...)
    'DASHBOARD_ACCEDER',
    'CLIENTS_GERER',
    'LOCATIONS_GERER',
    'PAIEMENTS_GERER',
    'DOCUMENTS_GERER',
    'PARAMETRES_GERER',
    'TRAVAUX_GERER',
    'IMPORTS_GERER',
    'NOTIFICATIONS_GERER',
    'PDF_EXPORTER',
  ],
  profilAdmin: {
    nomUtilisateur:
      process.env.SEED_ADMIN_NOM_UTILISATEUR ||
      process.env.SEED_ADMIN_TELEPHONE ||
      '771234568',
    nom: process.env.SEED_ADMIN_NOM || 'Admin KYA',
    statut: process.env.SEED_ADMIN_STATUT || 'ACTIF',
    modeAbonnement: process.env.SEED_ADMIN_MODE_ABONNEMENT || 'monthly',
    montantMensuelAbonnement: Number(process.env.SEED_ADMIN_MONTANT_MENSUEL || 5000),
    montantAnnuelAbonnement: Number(process.env.SEED_ADMIN_MONTANT_ANNUEL || 50000),
    autoriserMontantPersonnalise:
      String(process.env.SEED_ADMIN_AUTORISER_MONTANT_PERSONNALISE || 'false') === 'true',
  },
  entrepriseAdmin: {
    id: process.env.SEED_ENTREPRISE_ADMIN_ID || 'seed-entreprise-admin',
    nom: process.env.SEED_ENTREPRISE_ADMIN_NOM || 'Entreprise Admin KYA',
  },
  demandeAdmin: {
    id: process.env.SEED_DEMANDE_ADMIN_ID || 'seed-demande-admin',
    nom: process.env.SEED_DEMANDE_ADMIN_NOM || 'Demande Admin Demo',
    email: process.env.SEED_DEMANDE_ADMIN_EMAIL || 'demande-admin@kya.local',
    telephone: choisirTelephone(process.env.SEED_DEMANDE_ADMIN_TELEPHONE, '771234569'),
    nomEntreprise:
      process.env.SEED_DEMANDE_ADMIN_NOM_ENTREPRISE || 'Entreprise Demande Admin',
    statut: process.env.SEED_DEMANDE_ADMIN_STATUT || 'EN_ATTENTE',
    nomUtilisateur:
      process.env.SEED_DEMANDE_ADMIN_NOM_UTILISATEUR ||
      process.env.SEED_DEMANDE_ADMIN_TELEPHONE ||
      '771234569',
    motDePasse: process.env.SEED_DEMANDE_ADMIN_MOT_DE_PASSE || 'AdminRequest@123456',
    paye: String(process.env.SEED_DEMANDE_ADMIN_PAYE || 'false') === 'true',
  },
}
