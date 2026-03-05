import { createHash } from 'node:crypto'
import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { CODE_HTTP } from '@/src/messages'

type TypeChargeSignatureCloudinary = {
  folder?: string
}

export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const corps = (await requete.json().catch(() => ({}))) as TypeChargeSignatureCloudinary
    const apiKey = String(process.env.CLOUDINARY_API_KEY || '').trim()
    const apiSecret = String(process.env.CLOUDINARY_API_SECRET || '').trim()
    const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim()

    if (!apiKey || !apiSecret || !cloudName) {
      throw new ErreurHttp(
        CODE_HTTP.ERREUR_INTERNE,
        'Cloudinary non configure (CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET/CLOUDINARY_CLOUD_NAME).',
        { code: 'CLOUDINARY_NOT_CONFIGURED' }
      )
    }

    const folder = String(corps?.folder || '').trim()
    const timestamp = Math.floor(Date.now() / 1000)
    const params: Record<string, string> = { timestamp: String(timestamp) }
    if (folder) params.folder = folder

    const toSign = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&')
    const signature = createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex')

    return conteneurDependances.reponseHttp.succes({
      api_key: apiKey,
      timestamp,
      signature,
      cloud_name: cloudName,
    })
  }
)
