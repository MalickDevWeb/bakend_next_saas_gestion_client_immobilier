import { createHash } from 'node:crypto'
import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { lirePolitiquePlateforme } from '@/src/infrastructure/http/politiquePlateforme'
import { CODE_HTTP } from '@/src/messages'

type TypeChargeSignatureCloudinary = {
  folder?: string
  mimeType?: string
  sizeBytes?: number
}

type TypeConfigCloudinary = {
  apiKey: string
  apiSecret: string
  cloudName: string
}

function parserCloudinaryUrl(valeur: string): TypeConfigCloudinary | null {
  const brute = String(valeur || '').trim()
  if (!brute || !brute.startsWith('cloudinary://')) return null

  try {
    const sansProtocole = brute.slice('cloudinary://'.length)
    const [authPart, cloudNamePart] = sansProtocole.split('@')
    const [apiKeyPart, apiSecretPart] = String(authPart || '').split(':')
    const apiKey = String(apiKeyPart || '').trim()
    const apiSecret = String(apiSecretPart || '').trim()
    const cloudName = String(cloudNamePart || '').trim()
    if (!apiKey || !apiSecret || !cloudName) return null
    return { apiKey, apiSecret, cloudName }
  } catch {
    return null
  }
}

function mimeTypeAutorise(mimeType: string, autorises: string[]): boolean {
  const mimeNormalise = String(mimeType || '').trim().toLowerCase()
  if (!mimeNormalise) return false

  return autorises.some((autoriseBrut) => {
    const autorise = String(autoriseBrut || '').trim().toLowerCase()
    if (!autorise) return false
    if (autorise.endsWith('/*')) {
      const prefix = autorise.slice(0, -1)
      return mimeNormalise.startsWith(prefix)
    }
    return mimeNormalise === autorise
  })
}

export const POST = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const corps = (await requete.json().catch(() => ({}))) as TypeChargeSignatureCloudinary
    const politique = await lirePolitiquePlateforme(conteneurDependances.prisma)
    const cloudinaryDepuisUrl = parserCloudinaryUrl(String(process.env.CLOUDINARY_URL || ''))
    const apiKey = String(process.env.CLOUDINARY_API_KEY || cloudinaryDepuisUrl?.apiKey || '').trim()
    const apiSecret = String(process.env.CLOUDINARY_API_SECRET || cloudinaryDepuisUrl?.apiSecret || '').trim()
    const cloudName = String(
      process.env.CLOUDINARY_CLOUD_NAME || cloudinaryDepuisUrl?.cloudName || ''
    ).trim()

    if (!apiKey || !apiSecret || !cloudName) {
      throw new ErreurHttp(
        CODE_HTTP.ERREUR_INTERNE,
        'Cloudinary non configure (CLOUDINARY_URL ou CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET/CLOUDINARY_CLOUD_NAME).',
        { code: 'CLOUDINARY_NOT_CONFIGURED' }
      )
    }

    const tailleOctets = Number(corps?.sizeBytes || 0)
    const mimeType = String(corps?.mimeType || '').trim()
    const tailleMaxOctets = Math.max(1, Number(politique.documents.maxUploadMb || 1)) * 1024 * 1024
    if (Number.isFinite(tailleOctets) && tailleOctets > 0 && tailleOctets > tailleMaxOctets) {
      throw new ErreurHttp(
        CODE_HTTP.MAUVAISE_REQUETE,
        `Fichier trop volumineux (${politique.documents.maxUploadMb} MB max).`,
        { code: 'DOCUMENT_POLICY_VIOLATION', reason: 'MAX_UPLOAD_MB' }
      )
    }

    const mimeTypesAutorises = politique.documents.allowedMimeTypes || []
    if (mimeType && mimeTypesAutorises.length > 0 && !mimeTypeAutorise(mimeType, mimeTypesAutorises)) {
      throw new ErreurHttp(
        CODE_HTTP.MAUVAISE_REQUETE,
        `Type de fichier non autorise. Types autorises: ${mimeTypesAutorises.join(', ')}`,
        { code: 'DOCUMENT_POLICY_VIOLATION', reason: 'MIME_NOT_ALLOWED' }
      )
    }

    const folder = String(corps?.folder || '').trim()
    const timestamp = Math.floor(Date.now() / 1000)
  const params: Record<string, string> = { timestamp: String(timestamp) }
  if (folder) params.folder = folder
  // Forcer les ressources en mode authentifié afin d'éviter l'accès public direct
  params.type = 'authenticated'

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
