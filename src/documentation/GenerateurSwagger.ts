import swaggerJSDoc from 'swagger-jsdoc'

export class GenerateurSwagger {
  public static generer() {
    const urlServeur = String(process.env.PUBLIC_API_BASE_URL || '').trim()
    const serveurs = urlServeur ? [{ url: urlServeur }] : undefined

    return swaggerJSDoc({
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Backend KYA API',
          version: '1.0.0',
          description:
            'API backend KYA. Authentification par cookies securises (access, refresh, csrf) + support Bearer pour lecture contexte.',
        },
        servers: serveurs,
        tags: [
          {
            name: 'Authentification',
            description: 'Login, session, refresh, logout, TOTP super-admin, seconde authentification.',
          },
          {
            name: 'Administration Admin',
            description:
              'Fonctionnalites metier cote admin (clients, documents, paiements, parametres, notifications, imports, undo, audit).',
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
          },
        },
      },
      apis: ['./app/api/**/*.ts', './src/documentation/**/*.ts'],
    })
  }
}
