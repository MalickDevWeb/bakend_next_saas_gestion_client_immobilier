import { NextResponse } from 'next/server'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'

export class ReponseHttp {
  public succes<T>(donnees: T, statut = CODE_HTTP.OK): NextResponse<T> {
    return NextResponse.json(donnees, { status: statut })
  }

  public sansContenu(): NextResponse {
    return new NextResponse(null, { status: CODE_HTTP.SANS_CONTENU })
  }

  public erreur(erreur: unknown): NextResponse {
    if (erreur instanceof ErreurHttp) {
      const message = erreur.message
      const details = erreur.details ?? null
      const code =
        typeof details === 'object' && details && 'code' in (details as Record<string, unknown>)
          ? (details as Record<string, unknown>).code
          : null

      return NextResponse.json(
        {
          message,
          error: message,
          details,
          code,
        },
        { status: erreur.codeStatut }
      )
    }

    return NextResponse.json(
      {
        message: t(ERRORS.ERREUR_INTERNE_SERVEUR),
        error: t(ERRORS.ERREUR_INTERNE_SERVEUR),
      },
      { status: CODE_HTTP.ERREUR_INTERNE }
    )
  }
}
