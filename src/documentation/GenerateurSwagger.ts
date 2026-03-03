import swaggerJSDoc from 'swagger-jsdoc'

export class GenerateurSwagger {
  public static generer() {
    return swaggerJSDoc({
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Backend KYA API',
          version: '1.0.0',
        },
      },
      apis: ['./app/api/**/*.ts'],
    })
  }
}
