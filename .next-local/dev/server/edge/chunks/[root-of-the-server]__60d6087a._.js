(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__60d6087a._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/coeur/configuration/ConfigurationSecurite.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfigurationSecurite",
    ()=>ConfigurationSecurite
]);
class ConfigurationSecurite {
    cleJwt() {
        return process.env.AUTH_JWT_SECRET || process.env.AUTH_SECRET || 'dev-jwt-secret-a-remplacer';
    }
    cleChiffrementTotp() {
        return process.env.AUTH_TOTP_ENCRYPTION_KEY || process.env.AUTH_SECRET || 'dev-chiffrement-totp-a-remplacer';
    }
    dureeJetonAccesSecondes() {
        return this.nombreEntier(process.env.AUTH_ACCESS_TOKEN_TTL_SEC, 15 * 60);
    }
    dureeSessionSecondes() {
        return this.nombreEntier(process.env.AUTH_SESSION_TTL_SEC, 7 * 24 * 60 * 60);
    }
    dureeJetonRefreshSecondes() {
        return this.nombreEntier(process.env.AUTH_REFRESH_TOKEN_TTL_SEC, 30 * 24 * 60 * 60);
    }
    dureeSecondeAuthSuperAdminMillisecondes() {
        return this.nombreEntier(process.env.AUTH_SUPER_ADMIN_2FA_TTL_MS, 60 * 1000);
    }
    limiteEchecsConnexion() {
        return this.nombreEntier(process.env.AUTH_MAX_FAILED_ATTEMPTS, 5);
    }
    fenetreEchecsSecondes() {
        return this.nombreEntier(process.env.AUTH_FAILED_WINDOW_SEC, 10 * 60);
    }
    dureeBlocageSecondes() {
        return this.nombreEntier(process.env.AUTH_LOCK_DURATION_SEC, 15 * 60);
    }
    modeCookieSecurise() {
        const environnement = String(("TURBOPACK compile-time value", "development") || '').toLowerCase();
        return environnement === 'production';
    }
    modeSameSiteCookies() {
        const valeur = String(process.env.AUTH_COOKIE_SAME_SITE || 'strict').toLowerCase();
        return valeur === 'lax' ? 'lax' : 'strict';
    }
    cheminsExemptesCsrf() {
        return [
            '/api/authContext/login',
            '/authContext/login',
            '/api/auth/login',
            '/auth/login',
            '/api/sign',
            '/sign',
            '/api/sante',
            '/api/documentation'
        ];
    }
    originesCorsAutorisees() {
        const brute = String(process.env.CORS_ORIGINES_AUTORISEES || '');
        if (!brute.trim()) return [];
        return brute.split(',').map((valeur)=>valeur.trim()).filter(Boolean);
    }
    urlWebhookAlertes() {
        return String(process.env.ALERTE_SECURITE_WEBHOOK_URL || '').trim();
    }
    nombreEntier(valeurBrute, valeurParDefaut) {
        const valeur = Number(valeurBrute);
        if (!Number.isFinite(valeur) || valeur <= 0) return valeurParDefaut;
        return Math.floor(valeur);
    }
}
}),
"[project]/src/infrastructure/middlewares/MiddlewareJournalisation.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MiddlewareJournalisation",
    ()=>MiddlewareJournalisation
]);
class MiddlewareJournalisation {
    traiter(requete) {
        void requete;
        return null;
    }
}
}),
"[project]/src/messages/validation-keys.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_ERRORS",
    ()=>VALIDATION_ERRORS
]);
const VALIDATION_ERRORS = {
    GENERIQUE: 'validation.generique'
};
}),
"[project]/src/messages/franchais/validation.common.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_FR_COMMON",
    ()=>VALIDATION_MESSAGES_FR_COMMON
]);
const VALIDATION_MESSAGES_FR_COMMON = {};
}),
"[project]/src/messages/franchais/validation.auth.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_FR_AUTH",
    ()=>VALIDATION_MESSAGES_FR_AUTH
]);
const VALIDATION_MESSAGES_FR_AUTH = {};
}),
"[project]/src/messages/franchais/validation.client.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_FR_CLIENT",
    ()=>VALIDATION_MESSAGES_FR_CLIENT
]);
const VALIDATION_MESSAGES_FR_CLIENT = {};
}),
"[project]/src/messages/franchais/validation.property.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_FR_PROPERTY",
    ()=>VALIDATION_MESSAGES_FR_PROPERTY
]);
const VALIDATION_MESSAGES_FR_PROPERTY = {};
}),
"[project]/src/messages/franchais/validation.payment.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_FR_PAYMENT",
    ()=>VALIDATION_MESSAGES_FR_PAYMENT
]);
const VALIDATION_MESSAGES_FR_PAYMENT = {};
}),
"[project]/src/messages/franchais/validation.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_FR",
    ()=>VALIDATION_MESSAGES_FR
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$common$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/franchais/validation.common.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/franchais/validation.auth.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$client$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/franchais/validation.client.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$property$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/franchais/validation.property.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$payment$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/franchais/validation.payment.ts [middleware-edge] (ecmascript)");
;
;
;
;
;
const VALIDATION_MESSAGES_FR = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$common$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_FR_COMMON"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_FR_AUTH"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$client$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_FR_CLIENT"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$property$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_FR_PROPERTY"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$payment$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_FR_PAYMENT"]
};
}),
"[project]/src/messages/anglais/validation.common.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_EN_COMMON",
    ()=>VALIDATION_MESSAGES_EN_COMMON
]);
const VALIDATION_MESSAGES_EN_COMMON = {};
}),
"[project]/src/messages/anglais/validation.auth.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_EN_AUTH",
    ()=>VALIDATION_MESSAGES_EN_AUTH
]);
const VALIDATION_MESSAGES_EN_AUTH = {};
}),
"[project]/src/messages/anglais/validation.client.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_EN_CLIENT",
    ()=>VALIDATION_MESSAGES_EN_CLIENT
]);
const VALIDATION_MESSAGES_EN_CLIENT = {};
}),
"[project]/src/messages/anglais/validation.property.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_EN_PROPERTY",
    ()=>VALIDATION_MESSAGES_EN_PROPERTY
]);
const VALIDATION_MESSAGES_EN_PROPERTY = {};
}),
"[project]/src/messages/anglais/validation.payment.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_EN_PAYMENT",
    ()=>VALIDATION_MESSAGES_EN_PAYMENT
]);
const VALIDATION_MESSAGES_EN_PAYMENT = {};
}),
"[project]/src/messages/anglais/validation.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION_MESSAGES_EN",
    ()=>VALIDATION_MESSAGES_EN
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$common$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/anglais/validation.common.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/anglais/validation.auth.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$client$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/anglais/validation.client.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$property$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/anglais/validation.property.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$payment$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/anglais/validation.payment.ts [middleware-edge] (ecmascript)");
;
;
;
;
;
const VALIDATION_MESSAGES_EN = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$common$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_EN_COMMON"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_EN_AUTH"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$client$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_EN_CLIENT"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$property$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_EN_PROPERTY"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$payment$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_EN_PAYMENT"]
};
}),
"[project]/src/messages/validation.ts [middleware-edge] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tValidation",
    ()=>tValidation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$validation$2d$keys$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/validation-keys.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/franchais/validation.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/anglais/validation.ts [middleware-edge] (ecmascript)");
;
;
;
;
;
const tValidation = (key, lang = 'fr')=>{
    const messages = lang === 'fr' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$franchais$2f$validation$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_FR"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$anglais$2f$validation$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_MESSAGES_EN"];
    return messages[key] || key;
};
}),
"[project]/src/messages/app/actions.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ACTIONS",
    ()=>ACTIONS,
    "ACTIONS_EN",
    ()=>ACTIONS_EN,
    "ACTIONS_FR",
    ()=>ACTIONS_FR
]);
const ACTIONS = {
    CORRIGER: 'actions.corriger',
    RETENTER: 'actions.retenter'
};
const ACTIONS_FR = {
    [ACTIONS.CORRIGER]: 'Corriger',
    [ACTIONS.RETENTER]: 'Retenter'
};
const ACTIONS_EN = {
    [ACTIONS.CORRIGER]: 'Fix',
    [ACTIONS.RETENTER]: 'Retry'
};
}),
"[project]/src/messages/app/confirmations.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFIRMATIONS",
    ()=>CONFIRMATIONS,
    "CONFIRMATIONS_EN",
    ()=>CONFIRMATIONS_EN,
    "CONFIRMATIONS_FR",
    ()=>CONFIRMATIONS_FR
]);
const CONFIRMATIONS = {
    CONFIRMER_OPERATION: 'confirmations.confirmer_operation'
};
const CONFIRMATIONS_FR = {
    [CONFIRMATIONS.CONFIRMER_OPERATION]: 'Confirmer l\'operation'
};
const CONFIRMATIONS_EN = {
    [CONFIRMATIONS.CONFIRMER_OPERATION]: 'Confirm operation'
};
}),
"[project]/src/messages/app/entities.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ENTITIES",
    ()=>ENTITIES,
    "ENTITIES_EN",
    ()=>ENTITIES_EN,
    "ENTITIES_FR",
    ()=>ENTITIES_FR
]);
const ENTITIES = {
    SERVICE_SANTE: 'entities.service_sante',
    BASE_DE_DONNEES: 'entities.base_de_donnees'
};
const ENTITIES_FR = {
    [ENTITIES.SERVICE_SANTE]: 'Service sante',
    [ENTITIES.BASE_DE_DONNEES]: 'Base de donnees'
};
const ENTITIES_EN = {
    [ENTITIES.SERVICE_SANTE]: 'Health service',
    [ENTITIES.BASE_DE_DONNEES]: 'Database'
};
}),
"[project]/src/messages/app/errors.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ERRORS",
    ()=>ERRORS,
    "ERRORS_EN",
    ()=>ERRORS_EN,
    "ERRORS_FR",
    ()=>ERRORS_FR
]);
const ERRORS = {
    PARAMETRES_INVALIDES: 'errors.parametres_invalides',
    ERREUR_INTERNE_SERVEUR: 'errors.erreur_interne_serveur',
    AUTH_IDENTIFIANTS_INVALIDES: 'errors.auth_identifiants_invalides',
    AUTH_COMPTE_INACTIF: 'errors.auth_compte_inactif',
    AUTH_JETON_ACCES_MANQUANT: 'errors.auth_jeton_acces_manquant',
    AUTH_JETON_ACCES_INVALIDE: 'errors.auth_jeton_acces_invalide',
    AUTH_SESSION_INTROUVABLE: 'errors.auth_session_introuvable',
    AUTH_SESSION_REVOQUEE: 'errors.auth_session_revoquee',
    AUTH_SESSION_EXPIREE: 'errors.auth_session_expiree',
    AUTH_JETON_ACCES_OBSOLETE: 'errors.auth_jeton_acces_obsolete',
    AUTH_REFRESH_MANQUANT: 'errors.auth_refresh_manquant',
    AUTH_REFRESH_INVALIDE: 'errors.auth_refresh_invalide',
    AUTH_REFRESH_DEJA_UTILISE: 'errors.auth_refresh_deja_utilise',
    AUTH_REFRESH_EXPIRE: 'errors.auth_refresh_expire',
    AUTH_TOTP_INVALIDE: 'errors.auth_totp_invalide',
    AUTH_TOTP_NON_ACTIVE: 'errors.auth_totp_non_active',
    AUTH_ACCES_SUPER_ADMIN: 'errors.auth_acces_super_admin',
    AUTH_PERMISSION_MANQUANTE: 'errors.auth_permission_manquante',
    AUTH_SECONDE_AUTH_SUPER_ADMIN_REQUISE: 'errors.auth_seconde_auth_super_admin_requise',
    AUTH_TROP_DE_TENTATIVES: 'errors.auth_trop_de_tentatives',
    SECURITE_ORIGINE_NON_AUTORISEE: 'errors.securite_origine_non_autorisee',
    SECURITE_CSRF_INVALIDE: 'errors.securite_csrf_invalide',
    ADMIN_CLIENT_INTROUVABLE: 'errors.admin_client_introuvable',
    ADMIN_LOCATION_INTROUVABLE: 'errors.admin_location_introuvable',
    ADMIN_DOCUMENT_INTROUVABLE: 'errors.admin_document_introuvable',
    ADMIN_PAIEMENT_INTROUVABLE: 'errors.admin_paiement_introuvable',
    ADMIN_DEPOT_INTROUVABLE: 'errors.admin_depot_introuvable',
    ADMIN_TRAVAIL_INTROUVABLE: 'errors.admin_travail_introuvable',
    ADMIN_PARAMETRE_INTROUVABLE: 'errors.admin_parametre_introuvable',
    ADMIN_EXECUTION_IMPORT_INTROUVABLE: 'errors.admin_execution_import_introuvable',
    ADMIN_NOTIFICATION_INTROUVABLE: 'errors.admin_notification_introuvable',
    ADMIN_ACTION_ANNULATION_INTROUVABLE: 'errors.admin_action_annulation_introuvable',
    ADMIN_ROLLBACK_EXPIRE: 'errors.admin_rollback_expire',
    ADMIN_PAIEMENT_ABONNEMENT_INTROUVABLE: 'errors.admin_paiement_abonnement_introuvable',
    ADMIN_JOURNAL_AUDIT_INTROUVABLE: 'errors.admin_journal_audit_introuvable',
    ADMIN_IP_BLOQUEE_INTROUVABLE: 'errors.admin_ip_bloquee_introuvable',
    ADMIN_ADMIN_INTROUVABLE: 'errors.admin_admin_introuvable',
    ADMIN_DEMANDE_ADMIN_INTROUVABLE: 'errors.admin_demande_admin_introuvable',
    ADMIN_ENTREPRISE_INTROUVABLE: 'errors.admin_entreprise_introuvable',
    ADMIN_UTILISATEUR_INTROUVABLE: 'errors.admin_utilisateur_introuvable'
};
const ERRORS_FR = {
    [ERRORS.PARAMETRES_INVALIDES]: 'Parametres invalides',
    [ERRORS.ERREUR_INTERNE_SERVEUR]: 'Erreur interne serveur',
    [ERRORS.AUTH_IDENTIFIANTS_INVALIDES]: 'Identifiants invalides',
    [ERRORS.AUTH_COMPTE_INACTIF]: 'Compte inactif ou suspendu',
    [ERRORS.AUTH_JETON_ACCES_MANQUANT]: 'Jeton acces manquant',
    [ERRORS.AUTH_JETON_ACCES_INVALIDE]: 'Jeton acces invalide',
    [ERRORS.AUTH_SESSION_INTROUVABLE]: 'Session introuvable',
    [ERRORS.AUTH_SESSION_REVOQUEE]: 'Session revoquee',
    [ERRORS.AUTH_SESSION_EXPIREE]: 'Session expiree',
    [ERRORS.AUTH_JETON_ACCES_OBSOLETE]: 'Jeton acces obselete',
    [ERRORS.AUTH_REFRESH_MANQUANT]: 'Refresh token manquant',
    [ERRORS.AUTH_REFRESH_INVALIDE]: 'Refresh token invalide',
    [ERRORS.AUTH_REFRESH_DEJA_UTILISE]: 'Refresh token deja utilise',
    [ERRORS.AUTH_REFRESH_EXPIRE]: 'Refresh token expire',
    [ERRORS.AUTH_TOTP_INVALIDE]: 'Code TOTP invalide',
    [ERRORS.AUTH_TOTP_NON_ACTIVE]: 'TOTP non active pour ce Super Admin',
    [ERRORS.AUTH_ACCES_SUPER_ADMIN]: 'Acces reserve au Super Admin',
    [ERRORS.AUTH_PERMISSION_MANQUANTE]: 'Permission manquante',
    [ERRORS.AUTH_SECONDE_AUTH_SUPER_ADMIN_REQUISE]: 'Seconde authentification Super Admin requise',
    [ERRORS.AUTH_TROP_DE_TENTATIVES]: 'Trop de tentatives, reessayez plus tard',
    [ERRORS.SECURITE_ORIGINE_NON_AUTORISEE]: 'Origine non autorisee',
    [ERRORS.SECURITE_CSRF_INVALIDE]: 'CSRF token invalide ou absent',
    [ERRORS.ADMIN_CLIENT_INTROUVABLE]: 'Client introuvable',
    [ERRORS.ADMIN_LOCATION_INTROUVABLE]: 'Location introuvable',
    [ERRORS.ADMIN_DOCUMENT_INTROUVABLE]: 'Document introuvable',
    [ERRORS.ADMIN_PAIEMENT_INTROUVABLE]: 'Paiement introuvable',
    [ERRORS.ADMIN_DEPOT_INTROUVABLE]: 'Depot introuvable',
    [ERRORS.ADMIN_TRAVAIL_INTROUVABLE]: 'Item de travail introuvable',
    [ERRORS.ADMIN_PARAMETRE_INTROUVABLE]: 'Parametre introuvable',
    [ERRORS.ADMIN_EXECUTION_IMPORT_INTROUVABLE]: 'Execution import introuvable',
    [ERRORS.ADMIN_NOTIFICATION_INTROUVABLE]: 'Notification introuvable',
    [ERRORS.ADMIN_ACTION_ANNULATION_INTROUVABLE]: 'Action annulation introuvable',
    [ERRORS.ADMIN_ROLLBACK_EXPIRE]: 'Rollback expire (plus de 2 mois)',
    [ERRORS.ADMIN_PAIEMENT_ABONNEMENT_INTROUVABLE]: 'Paiement admin introuvable',
    [ERRORS.ADMIN_JOURNAL_AUDIT_INTROUVABLE]: 'Journal audit introuvable',
    [ERRORS.ADMIN_IP_BLOQUEE_INTROUVABLE]: 'IP bloquee introuvable',
    [ERRORS.ADMIN_ADMIN_INTROUVABLE]: 'Administrateur introuvable',
    [ERRORS.ADMIN_DEMANDE_ADMIN_INTROUVABLE]: 'Demande administrateur introuvable',
    [ERRORS.ADMIN_ENTREPRISE_INTROUVABLE]: 'Entreprise introuvable',
    [ERRORS.ADMIN_UTILISATEUR_INTROUVABLE]: 'Utilisateur introuvable'
};
const ERRORS_EN = {
    [ERRORS.PARAMETRES_INVALIDES]: 'Invalid parameters',
    [ERRORS.ERREUR_INTERNE_SERVEUR]: 'Internal server error',
    [ERRORS.AUTH_IDENTIFIANTS_INVALIDES]: 'Invalid credentials',
    [ERRORS.AUTH_COMPTE_INACTIF]: 'Inactive or suspended account',
    [ERRORS.AUTH_JETON_ACCES_MANQUANT]: 'Missing access token',
    [ERRORS.AUTH_JETON_ACCES_INVALIDE]: 'Invalid access token',
    [ERRORS.AUTH_SESSION_INTROUVABLE]: 'Session not found',
    [ERRORS.AUTH_SESSION_REVOQUEE]: 'Session revoked',
    [ERRORS.AUTH_SESSION_EXPIREE]: 'Session expired',
    [ERRORS.AUTH_JETON_ACCES_OBSOLETE]: 'Obsolete access token',
    [ERRORS.AUTH_REFRESH_MANQUANT]: 'Missing refresh token',
    [ERRORS.AUTH_REFRESH_INVALIDE]: 'Invalid refresh token',
    [ERRORS.AUTH_REFRESH_DEJA_UTILISE]: 'Refresh token already used',
    [ERRORS.AUTH_REFRESH_EXPIRE]: 'Refresh token expired',
    [ERRORS.AUTH_TOTP_INVALIDE]: 'Invalid TOTP code',
    [ERRORS.AUTH_TOTP_NON_ACTIVE]: 'TOTP not enabled for this Super Admin',
    [ERRORS.AUTH_ACCES_SUPER_ADMIN]: 'Super Admin only',
    [ERRORS.AUTH_PERMISSION_MANQUANTE]: 'Missing permission',
    [ERRORS.AUTH_SECONDE_AUTH_SUPER_ADMIN_REQUISE]: 'Super Admin second authentication required',
    [ERRORS.AUTH_TROP_DE_TENTATIVES]: 'Too many attempts, try again later',
    [ERRORS.SECURITE_ORIGINE_NON_AUTORISEE]: 'Unauthorized origin',
    [ERRORS.SECURITE_CSRF_INVALIDE]: 'Invalid or missing CSRF token',
    [ERRORS.ADMIN_CLIENT_INTROUVABLE]: 'Client not found',
    [ERRORS.ADMIN_LOCATION_INTROUVABLE]: 'Rental not found',
    [ERRORS.ADMIN_DOCUMENT_INTROUVABLE]: 'Document not found',
    [ERRORS.ADMIN_PAIEMENT_INTROUVABLE]: 'Payment not found',
    [ERRORS.ADMIN_DEPOT_INTROUVABLE]: 'Deposit not found',
    [ERRORS.ADMIN_TRAVAIL_INTROUVABLE]: 'Work item not found',
    [ERRORS.ADMIN_PARAMETRE_INTROUVABLE]: 'Setting not found',
    [ERRORS.ADMIN_EXECUTION_IMPORT_INTROUVABLE]: 'Import execution not found',
    [ERRORS.ADMIN_NOTIFICATION_INTROUVABLE]: 'Notification not found',
    [ERRORS.ADMIN_ACTION_ANNULATION_INTROUVABLE]: 'Undo action not found',
    [ERRORS.ADMIN_ROLLBACK_EXPIRE]: 'Rollback expired (more than 2 months)',
    [ERRORS.ADMIN_PAIEMENT_ABONNEMENT_INTROUVABLE]: 'Admin payment not found',
    [ERRORS.ADMIN_JOURNAL_AUDIT_INTROUVABLE]: 'Audit log not found',
    [ERRORS.ADMIN_IP_BLOQUEE_INTROUVABLE]: 'Blocked IP not found',
    [ERRORS.ADMIN_ADMIN_INTROUVABLE]: 'Admin not found',
    [ERRORS.ADMIN_DEMANDE_ADMIN_INTROUVABLE]: 'Admin request not found',
    [ERRORS.ADMIN_ENTREPRISE_INTROUVABLE]: 'Enterprise not found',
    [ERRORS.ADMIN_UTILISATEUR_INTROUVABLE]: 'User not found'
};
}),
"[project]/src/messages/app/labels.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LABELS",
    ()=>LABELS,
    "LABELS_EN",
    ()=>LABELS_EN,
    "LABELS_FR",
    ()=>LABELS_FR
]);
const LABELS = {
    API: 'labels.api',
    VERSION: 'labels.version'
};
const LABELS_FR = {
    [LABELS.API]: 'API',
    [LABELS.VERSION]: 'Version'
};
const LABELS_EN = {
    [LABELS.API]: 'API',
    [LABELS.VERSION]: 'Version'
};
}),
"[project]/src/messages/app/menu.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MENU",
    ()=>MENU,
    "MENU_EN",
    ()=>MENU_EN,
    "MENU_FR",
    ()=>MENU_FR
]);
const MENU = {
    SANTE: 'menu.sante',
    DOCUMENTATION: 'menu.documentation'
};
const MENU_FR = {
    [MENU.SANTE]: 'Sante',
    [MENU.DOCUMENTATION]: 'Documentation'
};
const MENU_EN = {
    [MENU.SANTE]: 'Health',
    [MENU.DOCUMENTATION]: 'Documentation'
};
}),
"[project]/src/messages/app/nav.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NAV",
    ()=>NAV,
    "NAV_EN",
    ()=>NAV_EN,
    "NAV_FR",
    ()=>NAV_FR
]);
const NAV = {
    RETOUR: 'nav.retour'
};
const NAV_FR = {
    [NAV.RETOUR]: 'Retour'
};
const NAV_EN = {
    [NAV.RETOUR]: 'Back'
};
}),
"[project]/src/messages/app/pages.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PAGES",
    ()=>PAGES,
    "PAGES_EN",
    ()=>PAGES_EN,
    "PAGES_FR",
    ()=>PAGES_FR
]);
const PAGES = {
    SANTE: 'pages.sante',
    DOCUMENTATION: 'pages.documentation'
};
const PAGES_FR = {
    [PAGES.SANTE]: 'Sante',
    [PAGES.DOCUMENTATION]: 'Documentation'
};
const PAGES_EN = {
    [PAGES.SANTE]: 'Health',
    [PAGES.DOCUMENTATION]: 'Documentation'
};
}),
"[project]/src/messages/app/status.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "STATUS",
    ()=>STATUS,
    "STATUS_EN",
    ()=>STATUS_EN,
    "STATUS_FR",
    ()=>STATUS_FR
]);
const STATUS = {
    OK: 'status.ok',
    DEGRADE: 'status.degrade',
    BASE_DONNEES_DISPONIBLE: 'status.base_de_donnees_disponible',
    BASE_DONNEES_INDISPONIBLE: 'status.base_de_donnees_indisponible'
};
const STATUS_FR = {
    [STATUS.OK]: 'ok',
    [STATUS.DEGRADE]: 'degrade',
    [STATUS.BASE_DONNEES_DISPONIBLE]: 'disponible',
    [STATUS.BASE_DONNEES_INDISPONIBLE]: 'indisponible'
};
const STATUS_EN = {
    [STATUS.OK]: 'ok',
    [STATUS.DEGRADE]: 'degraded',
    [STATUS.BASE_DONNEES_DISPONIBLE]: 'up',
    [STATUS.BASE_DONNEES_INDISPONIBLE]: 'down'
};
}),
"[project]/src/messages/app/success.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SUCCESS",
    ()=>SUCCESS,
    "SUCCESS_EN",
    ()=>SUCCESS_EN,
    "SUCCESS_FR",
    ()=>SUCCESS_FR
]);
const SUCCESS = {
    OPERATION_REUSSIE: 'success.operation_reussie'
};
const SUCCESS_FR = {
    [SUCCESS.OPERATION_REUSSIE]: 'Operation reussie'
};
const SUCCESS_EN = {
    [SUCCESS.OPERATION_REUSSIE]: 'Operation succeeded'
};
}),
"[project]/src/messages/app/validation.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALIDATION",
    ()=>VALIDATION,
    "VALIDATION_EN",
    ()=>VALIDATION_EN,
    "VALIDATION_FR",
    ()=>VALIDATION_FR
]);
const VALIDATION = {
    VERBEUX_INVALIDE: 'validation.verbeux_invalide'
};
const VALIDATION_FR = {
    [VALIDATION.VERBEUX_INVALIDE]: 'Le parametre verbeux est invalide'
};
const VALIDATION_EN = {
    [VALIDATION.VERBEUX_INVALIDE]: 'Verbose parameter is invalid'
};
}),
"[project]/src/messages/app.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MESSAGES",
    ()=>MESSAGES,
    "MESSAGES_EN",
    ()=>MESSAGES_EN,
    "MESSAGES_FR",
    ()=>MESSAGES_FR,
    "getAction",
    ()=>getAction,
    "getError",
    ()=>getError,
    "getLabel",
    ()=>getLabel,
    "getStatus",
    ()=>getStatus,
    "t",
    ()=>t
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$actions$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/actions.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$confirmations$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/confirmations.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$entities$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/entities.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$errors$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/errors.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$labels$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/labels.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$menu$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/menu.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$nav$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/nav.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$pages$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/pages.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$status$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/status.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$success$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/success.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$validation$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/validation.ts [middleware-edge] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const MESSAGES = {
    VALIDATION: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$validation$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION"],
    ACTIONS: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$actions$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ACTIONS"],
    ENTITIES: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$entities$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ENTITIES"],
    STATUS: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$status$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["STATUS"],
    PAGES: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$pages$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["PAGES"],
    SUCCESS: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$success$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["SUCCESS"],
    ERRORS: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$errors$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ERRORS"],
    CONFIRMATIONS: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$confirmations$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["CONFIRMATIONS"],
    LABELS: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$labels$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LABELS"],
    NAV: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$nav$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NAV"],
    MENU: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$menu$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MENU"]
};
const MESSAGES_FR = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$validation$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_FR"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$actions$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ACTIONS_FR"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$entities$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ENTITIES_FR"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$status$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["STATUS_FR"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$pages$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["PAGES_FR"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$success$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["SUCCESS_FR"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$errors$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ERRORS_FR"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$confirmations$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["CONFIRMATIONS_FR"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$labels$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LABELS_FR"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$nav$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NAV_FR"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$menu$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MENU_FR"]
};
const MESSAGES_EN = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$validation$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["VALIDATION_EN"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$actions$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ACTIONS_EN"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$entities$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ENTITIES_EN"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$status$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["STATUS_EN"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$pages$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["PAGES_EN"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$success$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["SUCCESS_EN"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$errors$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ERRORS_EN"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$confirmations$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["CONFIRMATIONS_EN"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$labels$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["LABELS_EN"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$nav$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NAV_EN"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$menu$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MENU_EN"]
};
const t = (key, lang = 'fr', params)=>{
    const messages = lang === 'fr' ? MESSAGES_FR : MESSAGES_EN;
    let message = messages[key] || key;
    if (params) {
        Object.entries(params).forEach(([param, value])=>{
            message = message.replace(new RegExp(`{${param}}`, 'g'), value);
        });
    }
    return message;
};
const getAction = (key, lang = 'fr')=>{
    return t(MESSAGES.ACTIONS[key], lang);
};
const getLabel = (key, lang = 'fr')=>{
    return t(MESSAGES.LABELS[key], lang);
};
const getStatus = (key, lang = 'fr')=>{
    return t(MESSAGES.STATUS[key], lang);
};
const getError = (key, lang = 'fr')=>{
    return t(MESSAGES.ERRORS[key], lang);
};
}),
"[project]/src/messages/app/administration.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODES_PERMISSIONS_RESSOURCES_ADMIN",
    ()=>CODES_PERMISSIONS_RESSOURCES_ADMIN,
    "DUREE_ANNULATION_MILLISECONDES",
    ()=>DUREE_ANNULATION_MILLISECONDES
]);
const CODES_PERMISSIONS_RESSOURCES_ADMIN = {
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
    cloudinary: 'DOCUMENTS_GERER'
};
const DUREE_ANNULATION_MILLISECONDES = 60 * 24 * 60 * 60 * 1000;
}),
"[project]/src/messages/app/code.http.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODE_HTTP",
    ()=>CODE_HTTP
]);
const CODE_HTTP = {
    OK: 200,
    CREE: 201,
    SANS_CONTENU: 204,
    MAUVAISE_REQUETE: 400,
    NON_AUTHENTIFIE: 401,
    INTERDIT: 403,
    NON_TROUVE: 404,
    CONFLIT: 409,
    PRECONDITION_REQUISE: 412,
    TROP_DE_REQUETES: 429,
    ERREUR_INTERNE: 500,
    SERVICE_INDISPONIBLE: 503
};
}),
"[project]/src/messages/index.ts [middleware-edge] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ACTIONS",
    ()=>ACTIONS,
    "CONFIRMATIONS",
    ()=>CONFIRMATIONS,
    "ENTITIES",
    ()=>ENTITIES,
    "ERRORS",
    ()=>ERRORS,
    "LABELS",
    ()=>LABELS,
    "MENU",
    ()=>MENU,
    "NAV",
    ()=>NAV,
    "PAGES",
    ()=>PAGES,
    "STATUS",
    ()=>STATUS,
    "SUCCESS",
    ()=>SUCCESS,
    "VALIDATION",
    ()=>VALIDATION
]);
/**
 * Point d'entree centralise pour tous les messages de l'application
 * Importer uniquement ce fichier dans le reste du projet
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$validation$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/messages/validation.ts [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$administration$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/administration.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$code$2e$http$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/code.http.ts [middleware-edge] (ecmascript)");
;
;
;
;
;
const ACTIONS = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MESSAGES"].ACTIONS;
const LABELS = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MESSAGES"].LABELS;
const STATUS = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MESSAGES"].STATUS;
const PAGES = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MESSAGES"].PAGES;
const SUCCESS = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MESSAGES"].SUCCESS;
const ERRORS = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MESSAGES"].ERRORS;
const CONFIRMATIONS = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MESSAGES"].CONFIRMATIONS;
const NAV = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MESSAGES"].NAV;
const ENTITIES = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MESSAGES"].ENTITIES;
const MENU = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MESSAGES"].MENU;
const VALIDATION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MESSAGES"].VALIDATION;
;
}),
"[project]/src/infrastructure/middlewares/MiddlewareMaintenance.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MiddlewareMaintenance",
    ()=>MiddlewareMaintenance
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$index$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/messages/index.ts [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$code$2e$http$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/code.http.ts [middleware-edge] (ecmascript)");
;
;
class MiddlewareMaintenance {
    routesAutorisees = new Set([
        '/api/sante',
        '/api/documentation'
    ]);
    traiter(requete) {
        const maintenanceActive = process.env.MAINTENANCE_ACTIVE === 'true';
        if (!maintenanceActive) {
            return null;
        }
        if (this.routesAutorisees.has(requete.nextUrl.pathname)) {
            return null;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Maintenance active. Veuillez reessayer plus tard.'
        }, {
            status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$code$2e$http$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["CODE_HTTP"].SERVICE_INDISPONIBLE
        });
    }
}
}),
"[project]/src/infrastructure/middlewares/PipelineMiddlewaresHttp.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PipelineMiddlewaresHttp",
    ()=>PipelineMiddlewaresHttp,
    "pipelineMiddlewaresHttp",
    ()=>pipelineMiddlewaresHttp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$middlewares$2f$MiddlewareJournalisation$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/infrastructure/middlewares/MiddlewareJournalisation.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$middlewares$2f$MiddlewareMaintenance$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/infrastructure/middlewares/MiddlewareMaintenance.ts [middleware-edge] (ecmascript)");
;
;
class PipelineMiddlewaresHttp {
    middlewares;
    constructor(middlewares = [
        new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$middlewares$2f$MiddlewareJournalisation$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MiddlewareJournalisation"](),
        new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$middlewares$2f$MiddlewareMaintenance$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["MiddlewareMaintenance"]()
    ]){
        this.middlewares = middlewares;
    }
    async executer(requete) {
        for (const middleware of this.middlewares){
            const resultat = await middleware.traiter(requete);
            if (resultat) {
                return resultat;
            }
        }
        return null;
    }
}
const pipelineMiddlewaresHttp = new PipelineMiddlewaresHttp();
}),
"[project]/src/infrastructure/securite/ServiceCorsStrict.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceCorsStrict",
    ()=>ServiceCorsStrict
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$index$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/messages/index.ts [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$code$2e$http$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/code.http.ts [middleware-edge] (ecmascript)");
;
;
class ServiceCorsStrict {
    originesAutorisees;
    constructor(originesAutorisees){
        this.originesAutorisees = originesAutorisees;
    }
    traiterPreflight(requete) {
        const origin = requete.headers.get('origin') || '';
        const reponse = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"](null, {
            status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$code$2e$http$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["CODE_HTTP"].SANS_CONTENU
        });
        this.appliquerEntetesCors(reponse, origin);
        return reponse;
    }
    appliquerEntetesCors(reponse, origin) {
        if (!origin) return;
        if (!this.estOrigineAutorisee(origin)) return;
        reponse.headers.set('Access-Control-Allow-Origin', origin);
        reponse.headers.set('Access-Control-Allow-Credentials', 'true');
        reponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
        reponse.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        reponse.headers.set('Vary', 'Origin');
    }
    estRequeteInterdite(origin) {
        if (!origin) return false;
        return !this.estOrigineAutorisee(origin);
    }
    estOrigineAutorisee(origin) {
        return this.originesAutorisees.includes(origin);
    }
}
}),
"[project]/src/infrastructure/securite/ServiceEntetesSecuriteHttp.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceEntetesSecuriteHttp",
    ()=>ServiceEntetesSecuriteHttp
]);
class ServiceEntetesSecuriteHttp {
    appliquer(reponse) {
        reponse.headers.set('X-Content-Type-Options', 'nosniff');
        reponse.headers.set('X-Frame-Options', 'DENY');
        reponse.headers.set('Referrer-Policy', 'no-referrer');
        reponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        reponse.headers.set('Content-Security-Policy', "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
        reponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        reponse.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
        reponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        return reponse;
    }
}
}),
"[project]/src/infrastructure/securite/ServiceProtectionCsrf.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceProtectionCsrf",
    ()=>ServiceProtectionCsrf
]);
class ServiceProtectionCsrf {
    verifier(requete) {
        const tokenCookie = requete.cookies.get('kya_csrf_token')?.value || '';
        const tokenEntete = requete.headers.get('x-csrf-token') || '';
        if (!tokenCookie || !tokenEntete) return false;
        return tokenCookie === tokenEntete;
    }
}
}),
"[project]/src/infrastructure/middlewares/MiddlewareGlobal.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MiddlewareGlobal",
    ()=>MiddlewareGlobal,
    "middlewareGlobal",
    ()=>middlewareGlobal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$coeur$2f$configuration$2f$ConfigurationSecurite$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/coeur/configuration/ConfigurationSecurite.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$middlewares$2f$PipelineMiddlewaresHttp$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/infrastructure/middlewares/PipelineMiddlewaresHttp.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$securite$2f$ServiceCorsStrict$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/infrastructure/securite/ServiceCorsStrict.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$securite$2f$ServiceEntetesSecuriteHttp$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/infrastructure/securite/ServiceEntetesSecuriteHttp.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$securite$2f$ServiceProtectionCsrf$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/infrastructure/securite/ServiceProtectionCsrf.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$index$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/messages/index.ts [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$code$2e$http$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app/code.http.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/messages/app.ts [middleware-edge] (ecmascript)");
;
;
;
;
;
;
;
const PREFIXES_ROUTES_API = [
    '/api',
    '/authContext',
    '/auth',
    '/clients',
    '/documents',
    '/payments',
    '/deposits',
    '/work_items',
    '/settings',
    '/import_runs',
    '/notifications',
    '/undo-actions',
    '/admin_payments',
    '/audit_logs',
    '/blocked_ips',
    '/cloudinary',
    '/sign'
];
class MiddlewareGlobal {
    pipeline;
    configurationSecurite;
    serviceCorsStrict;
    serviceEntetesSecuriteHttp;
    serviceProtectionCsrf;
    constructor(pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$middlewares$2f$PipelineMiddlewaresHttp$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["pipelineMiddlewaresHttp"], configurationSecurite){
        this.pipeline = pipeline;
        this.serviceEntetesSecuriteHttp = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$securite$2f$ServiceEntetesSecuriteHttp$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ServiceEntetesSecuriteHttp"]();
        this.serviceProtectionCsrf = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$securite$2f$ServiceProtectionCsrf$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ServiceProtectionCsrf"]();
        this.configurationSecurite = configurationSecurite ?? new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$coeur$2f$configuration$2f$ConfigurationSecurite$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ConfigurationSecurite"]();
        this.serviceCorsStrict = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$securite$2f$ServiceCorsStrict$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["ServiceCorsStrict"](this.configurationSecurite.originesCorsAutorisees());
    }
    async executer(requete) {
        const chemin = requete.nextUrl.pathname;
        const origine = requete.headers.get('origin') || '';
        const origineLocale = requete.nextUrl.origin;
        const estRouteApi = PREFIXES_ROUTES_API.some((prefixe)=>chemin.startsWith(prefixe));
        if (estRouteApi && requete.method === 'OPTIONS') {
            const reponsePreflight = this.serviceCorsStrict.traiterPreflight(requete);
            return this.serviceEntetesSecuriteHttp.appliquer(reponsePreflight);
        }
        if (estRouteApi && origine && origine !== origineLocale && this.serviceCorsStrict.estRequeteInterdite(origine)) {
            const reponseInterdite = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["t"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$index$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ERRORS"].SECURITE_ORIGINE_NON_AUTORISEE)
            }, {
                status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$code$2e$http$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["CODE_HTTP"].INTERDIT
            });
            return this.serviceEntetesSecuriteHttp.appliquer(reponseInterdite);
        }
        const methodesAvecCorps = new Set([
            'POST',
            'PUT',
            'PATCH',
            'DELETE'
        ]);
        const csrfExemptes = new Set(this.configurationSecurite.cheminsExemptesCsrf());
        if (estRouteApi && methodesAvecCorps.has(requete.method.toUpperCase()) && !csrfExemptes.has(chemin) && !this.serviceProtectionCsrf.verifier(requete)) {
            const reponseCsrf = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["t"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$index$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ERRORS"].SECURITE_CSRF_INVALIDE),
                code: 'CSRF_INVALID'
            }, {
                status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$messages$2f$app$2f$code$2e$http$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["CODE_HTTP"].INTERDIT
            });
            return this.serviceEntetesSecuriteHttp.appliquer(reponseCsrf);
        }
        const reponsePipeline = await this.pipeline.executer(requete);
        const reponse = reponsePipeline ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
        if (estRouteApi) {
            this.serviceCorsStrict.appliquerEntetesCors(reponse, origine);
        }
        return this.serviceEntetesSecuriteHttp.appliquer(reponse);
    }
}
const middlewareGlobal = new MiddlewareGlobal();
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$middlewares$2f$MiddlewareGlobal$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/infrastructure/middlewares/MiddlewareGlobal.ts [middleware-edge] (ecmascript)");
;
async function middleware(requete) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$infrastructure$2f$middlewares$2f$MiddlewareGlobal$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["middlewareGlobal"].executer(requete);
}
const config = {
    matcher: [
        '/api/:path*',
        '/authContext/:path*',
        '/auth/:path*',
        '/clients/:path*',
        '/documents/:path*',
        '/payments/:path*',
        '/deposits/:path*',
        '/work_items/:path*',
        '/settings/:path*',
        '/import_runs/:path*',
        '/notifications/:path*',
        '/undo-actions/:path*',
        '/admin_payments/:path*',
        '/audit_logs/:path*',
        '/blocked_ips/:path*',
        '/cloudinary/:path*'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__60d6087a._.js.map