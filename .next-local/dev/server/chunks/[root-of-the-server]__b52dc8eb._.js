module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/src/documentation/GenerateurSwagger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GenerateurSwagger",
    ()=>GenerateurSwagger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swagger$2d$jsdoc$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/swagger-jsdoc/index.js [app-route] (ecmascript)");
;
class GenerateurSwagger {
    static normaliserUrl(url) {
        const propre = url.trim();
        if (!propre) return '';
        return propre.endsWith('/') ? propre.slice(0, -1) : propre;
    }
    static ajouterServeur(serveurs, url, description) {
        const normalisee = this.normaliserUrl(String(url || ''));
        if (!normalisee) return;
        if (serveurs.has(normalisee)) return;
        serveurs.set(normalisee, description);
    }
    static generer(baseUrl) {
        const serveurs = new Map();
        this.ajouterServeur(serveurs, baseUrl, 'Serveur courant');
        const urlsMultiples = String(process.env.PUBLIC_API_BASE_URLS || '').trim();
        if (urlsMultiples) {
            for (const url of urlsMultiples.split(',')){
                this.ajouterServeur(serveurs, url, 'Serveur configure');
            }
        }
        const urlServeur = String(process.env.PUBLIC_API_BASE_URL || '').trim();
        this.ajouterServeur(serveurs, urlServeur, 'Serveur configure');
        const environnement = String(("TURBOPACK compile-time value", "development") || '').toLowerCase();
        if (environnement !== 'production') {
            this.ajouterServeur(serveurs, 'http://localhost:3001', 'Local');
            this.ajouterServeur(serveurs, 'http://127.0.0.1:3001', 'Local');
        }
        const serveursFinal = serveurs.size ? Array.from(serveurs.entries()).map(([url, description])=>({
                url,
                description
            })) : undefined;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swagger$2d$jsdoc$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Backend KYA API',
                    version: '1.0.0',
                    description: 'API backend KYA. Authentification par cookies securises (access, refresh, csrf) + support Bearer pour lecture contexte. Regle de scope: un ADMIN ne manipule que ses ressources (adminId). Un SUPER_ADMIN peut tester/operer sur un scope admin via /api/authContext/impersonate.'
                },
                servers: serveursFinal,
                tags: [
                    {
                        name: 'Authentification',
                        description: 'Login, session, refresh, logout, TOTP super-admin, seconde authentification.'
                    },
                    {
                        name: 'Administration Admin',
                        description: 'Fonctionnalites metier cote admin (clients, documents, paiements, parametres, notifications, imports, undo, audit). Scope strict par adminId pour role ADMIN. SUPER_ADMIN: acces via impersonation pour les ressources scopees.'
                    },
                    {
                        name: 'Securite',
                        description: 'Audit securite et controles RBAC serveur.'
                    },
                    {
                        name: 'Sante',
                        description: 'Verification etat serveur.'
                    }
                ],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                            description: 'Authorization: Bearer <access_token>'
                        },
                        accessTokenCookie: {
                            type: 'apiKey',
                            in: 'cookie',
                            name: 'kya_access_token',
                            description: 'Cookie access token ecrit apres login.'
                        },
                        refreshTokenCookie: {
                            type: 'apiKey',
                            in: 'cookie',
                            name: 'kya_refresh_token',
                            description: 'Cookie refresh token pour la rotation de session.'
                        },
                        csrfHeader: {
                            type: 'apiKey',
                            in: 'header',
                            name: 'x-csrf-token',
                            description: 'Doit correspondre au cookie kya_csrf_token (double submit token).'
                        },
                        impersonationCookie: {
                            type: 'apiKey',
                            in: 'cookie',
                            name: 'kya_impersonation',
                            description: 'Cookie d impersonation ecrit par /api/authContext/impersonate pour SUPER_ADMIN.'
                        }
                    }
                }
            },
            apis: [
                './app/api/**/*.ts',
                './src/documentation/**/*.ts'
            ]
        });
    }
}
}),
"[project]/app/api/documentation/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$documentation$2f$GenerateurSwagger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/documentation/GenerateurSwagger.ts [app-route] (ecmascript)");
;
;
function determinerOrigine(requete) {
    const proto = requete.headers.get('x-forwarded-proto');
    const host = requete.headers.get('x-forwarded-host') || requete.headers.get('host');
    if (proto && host) return `${proto}://${host}`;
    return requete.nextUrl.origin;
}
async function GET(requete) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$documentation$2f$GenerateurSwagger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GenerateurSwagger"].generer(determinerOrigine(requete)));
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b52dc8eb._.js.map