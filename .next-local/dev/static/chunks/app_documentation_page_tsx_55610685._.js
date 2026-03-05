(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/documentation/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PageDocumentation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swagger$2d$ui$2d$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/swagger-ui-react/index.mjs [app-client] (ecmascript)");
'use client';
;
;
;
function lireCookie(nom) {
    const cookie = `; ${document.cookie}`;
    const parties = cookie.split(`; ${nom}=`);
    if (parties.length < 2) return '';
    return decodeURIComponent(parties.pop()?.split(';').shift() || '');
}
function PageDocumentation() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: 16
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 16,
                    border: '1px solid #d0d7de',
                    borderRadius: 8,
                    padding: 12,
                    background: '#f6f8fa'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Guide test Swagger"
                    }, void 0, false, {
                        fileName: "[project]/app/documentation/page.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                        style: {
                            margin: '8px 0 0 20px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: "Executer `POST /api/authContext/login` (ADMIN ou SUPER_ADMIN)."
                            }, void 0, false, {
                                fileName: "[project]/app/documentation/page.tsx",
                                lineNumber: 34,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: "Pour SUPER_ADMIN: executer `POST /api/authContext/super-admin/second-auth`, puis `POST /api/authContext/impersonate`."
                            }, void 0, false, {
                                fileName: "[project]/app/documentation/page.tsx",
                                lineNumber: 35,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: "Tester `GET /api/clients`: le resultat est scope par `adminId` (ADMIN direct ou impersonation active)."
                            }, void 0, false, {
                                fileName: "[project]/app/documentation/page.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/documentation/page.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/documentation/page.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swagger$2d$ui$2d$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                url: "/api/documentation",
                requestInterceptor: (requete)=>{
                    const requeteMut = {
                        ...requete
                    };
                    requeteMut.credentials = 'include';
                    requeteMut.headers = {
                        ...requeteMut.headers || {}
                    };
                    const methode = String(requeteMut.method || 'GET').toUpperCase();
                    const tokenCsrf = lireCookie('kya_csrf_token');
                    const estMutation = [
                        'POST',
                        'PUT',
                        'PATCH',
                        'DELETE'
                    ].includes(methode);
                    if (estMutation && tokenCsrf && !requeteMut.headers['x-csrf-token']) {
                        requeteMut.headers['x-csrf-token'] = tokenCsrf;
                    }
                    return requeteMut;
                }
            }, void 0, false, {
                fileName: "[project]/app/documentation/page.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/documentation/page.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
_c = PageDocumentation;
var _c;
__turbopack_context__.k.register(_c, "PageDocumentation");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_documentation_page_tsx_55610685._.js.map