import swaggerJSDoc from 'swagger-jsdoc'

export class GenerateurSwagger {
  private static normaliserUrl(url: string): string {
    const propre = url.trim()
    if (!propre) return ''
    return propre.endsWith('/') ? propre.slice(0, -1) : propre
  }

  private static ajouterServeur(
    serveurs: Map<string, string>,
    url: string | undefined,
    description: string
  ) {
    const normalisee = this.normaliserUrl(String(url || ''))
    if (!normalisee) return
    if (serveurs.has(normalisee)) return
    serveurs.set(normalisee, description)
  }

  public static generer(baseUrl?: string) {
    const serveurs = new Map<string, string>()

    this.ajouterServeur(serveurs, baseUrl, 'Serveur courant')

    const urlsMultiples = String(process.env.PUBLIC_API_BASE_URLS || '').trim()
    if (urlsMultiples) {
      for (const url of urlsMultiples.split(',')) {
        this.ajouterServeur(serveurs, url, 'Serveur configure')
      }
    }

    const urlServeur = String(process.env.PUBLIC_API_BASE_URL || '').trim()
    this.ajouterServeur(serveurs, urlServeur, 'Serveur configure')

    const environnement = String(process.env.NODE_ENV || '').toLowerCase()
    if (environnement !== 'production') {
      this.ajouterServeur(serveurs, 'http://localhost:3001', 'Local')
      this.ajouterServeur(serveurs, 'http://127.0.0.1:3001', 'Local')
    }

    const serveursFinal = serveurs.size
      ? Array.from(serveurs.entries()).map(([url, description]) => ({ url, description }))
      : undefined

    return swaggerJSDoc({
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Backend KYA API',
          version: '1.0.0',
          description:
            'API backend KYA. Authentification par cookies securises (access, refresh, csrf) + support Bearer pour lecture contexte. Regle de scope: un ADMIN ne manipule que ses ressources (adminId). Un SUPER_ADMIN peut tester/operer sur un scope admin via /api/authContext/impersonate.',
        },
        servers: serveursFinal,
        tags: [
          {
            name: 'Authentification',
            description: 'Login, session, refresh, logout, TOTP super-admin, seconde authentification.',
          },
          {
            name: 'Administration Admin',
            description:
              'Fonctionnalites metier cote admin (clients, documents, paiements, parametres, notifications, imports, undo, audit). Scope strict par adminId pour role ADMIN. SUPER_ADMIN: acces via impersonation pour les ressources scopees.',
          },
          {
            name: 'Securite',
            description: 'Audit securite et controles RBAC serveur.',
          },
          {
            name: 'Sante',
            description: 'Verification etat serveur.',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Authorization: Bearer <access_token>',
            },
            accessTokenCookie: {
              type: 'apiKey',
              in: 'cookie',
              name: 'kya_access_token',
              description: 'Cookie access token ecrit apres login.',
            },
            refreshTokenCookie: {
              type: 'apiKey',
              in: 'cookie',
              name: 'kya_refresh_token',
              description: 'Cookie refresh token pour la rotation de session.',
            },
            csrfHeader: {
              type: 'apiKey',
              in: 'header',
              name: 'x-csrf-token',
              description: 'Doit correspondre au cookie kya_csrf_token (double submit token).',
            },
            impersonationCookie: {
              type: 'apiKey',
              in: 'cookie',
              name: 'kya_impersonation',
              description:
                'Cookie d impersonation ecrit par /api/authContext/impersonate pour SUPER_ADMIN.',
            },
          },
        },
      },
      apis: ['./app/api/**/*.ts', './src/documentation/**/*.ts'],
    })
  }
}
