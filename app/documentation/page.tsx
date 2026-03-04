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
  )
}
