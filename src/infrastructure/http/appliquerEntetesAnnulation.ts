import { NextResponse } from 'next/server'
import { TypeMetadonneesActionAnnulationAdministrationAdmin } from '@/src/domaine/types/administration'

export function appliquerEntetesAnnulation(
  reponse: NextResponse,
  annulation?: TypeMetadonneesActionAnnulationAdministrationAdmin
): NextResponse {
  if (!annulation) return reponse

  reponse.headers.set('x-undo-id', annulation.id)
  reponse.headers.set('x-undo-expires-at', annulation.expiresAt)
  reponse.headers.set('x-undo-resource', annulation.resource)
  reponse.headers.set('x-undo-resource-id', String(annulation.resourceId || ''))
  return reponse
}
