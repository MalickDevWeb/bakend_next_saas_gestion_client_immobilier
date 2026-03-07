import { NextRequest, NextResponse } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'

type TypeFormatExportAudit = 'csv' | 'json'

function normaliserFormat(valeur: string | null): TypeFormatExportAudit {
  return String(valeur || '').trim().toLowerCase() === 'json' ? 'json' : 'csv'
}

function creerNomFichier(format: TypeFormatExportAudit): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `audit_logs_${stamp}.${format}`
}

function echapperCsv(valeur: unknown): string {
  return `"${String(valeur ?? '').replace(/"/g, '""')}"`
}

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const requeteUrl = new URL(requete.url)
    const format = normaliserFormat(requeteUrl.searchParams.get('format'))
    const donnees = await conteneurDependances.controleurAdministrationAdmin.listerJournauxAudit(
      jetonAcces,
      impersonation,
      requeteUrl
    )
    const nomFichier = creerNomFichier(format)

    if (format === 'json') {
      return new NextResponse(JSON.stringify(donnees, null, 2), {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'content-disposition': `attachment; filename="${nomFichier}"`,
        },
      })
    }

    const colonnes = ['id', 'createdAt', 'actor', 'action', 'targetType', 'targetId', 'message', 'ipAddress']
    const lignes = donnees.map((ligne) =>
      colonnes.map((colonne) => echapperCsv((ligne as Record<string, unknown>)[colonne])).join(',')
    )
    const contenu = [colonnes.join(','), ...lignes].join('\n')

    return new NextResponse(contenu, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${nomFichier}"`,
      },
    })
  }
)
