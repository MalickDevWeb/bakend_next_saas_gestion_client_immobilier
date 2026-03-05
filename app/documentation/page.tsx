'use client'

import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

type TypeRequeteSwagger = {
  url?: string
  method?: string
  headers?: Record<string, string>
  credentials?: RequestCredentials
}

function lireCookie(nom: string): string {
  const cookie = `; ${document.cookie}`
  const parties = cookie.split(`; ${nom}=`)
  if (parties.length < 2) return ''
  return decodeURIComponent(parties.pop()?.split(';').shift() || '')
}

export default function PageDocumentation() {
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          marginBottom: 16,
          border: '1px solid #d0d7de',
          borderRadius: 8,
          padding: 12,
          background: '#f6f8fa',
        }}
      >
        <strong>Guide test Swagger</strong>
        <ol style={{ margin: '8px 0 0 20px' }}>
          <li>Executer `POST /api/authContext/login` (ADMIN ou SUPER_ADMIN).</li>
          <li>
            Pour SUPER_ADMIN: executer `POST /api/authContext/super-admin/second-auth`, puis
            `POST /api/authContext/impersonate`.
          </li>
          <li>
            Tester `GET /api/clients`: le resultat est scope par `adminId` (ADMIN direct ou
            impersonation active).
          </li>
        </ol>
      </div>
      <SwaggerUI
        url="/api/documentation"
        requestInterceptor={(requete: TypeRequeteSwagger) => {
          const requeteMut = { ...requete }
          requeteMut.credentials = 'include'
          requeteMut.headers = {
            ...(requeteMut.headers || {}),
          }

          const methode = String(requeteMut.method || 'GET').toUpperCase()
          const tokenCsrf = lireCookie('kya_csrf_token')
          const estMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(methode)
          if (estMutation && tokenCsrf && !requeteMut.headers['x-csrf-token']) {
            requeteMut.headers['x-csrf-token'] = tokenCsrf
          }

          return requeteMut
        }}
      />
    </div>
  )
}
