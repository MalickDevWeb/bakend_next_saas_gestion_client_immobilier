import { NextRequest, NextResponse } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import {
  creerNomFichierExportAudit,
  genererContenuExportAudit,
  normaliserFormatExportAudit,
} from '@/src/infrastructure/http/exportAuditLogs'

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const requeteUrl = new URL(requete.url)
    const format = normaliserFormatExportAudit(requeteUrl.searchParams.get('format'))
    const donnees = await conteneurDependances.controleurAdministrationAdmin.listerJournauxAudit(
      jetonAcces,
      impersonation,
      requeteUrl
    )
    const nomFichier = creerNomFichierExportAudit(format)
    const contenu = genererContenuExportAudit(donnees, format)

    if (format === 'json') {
      return new NextResponse(contenu, {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'content-disposition': `attachment; filename="${nomFichier}"`,
        },
      })
    }

    return new NextResponse(contenu, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${nomFichier}"`,
      },
    })
  }
)
