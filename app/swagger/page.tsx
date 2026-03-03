'use client'

import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function PageSwagger() {
  return <SwaggerUI url="/api/documentation" />
}
