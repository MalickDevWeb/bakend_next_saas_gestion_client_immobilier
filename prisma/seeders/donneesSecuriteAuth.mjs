export const DONNEES_SECURITE_AUTH = {
  superAdmin: {
    telephone:
      process.env.SEED_SUPER_ADMIN_TELEPHONE ||
      process.env.SEED_SUPER_ADMIN_UTILISATEUR ||
      '771234567',
    email: process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@kya.local',
    motDePasse: process.env.SEED_SUPER_ADMIN_MOT_DE_PASSE || 'SuperAdmin@123456',
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
}
