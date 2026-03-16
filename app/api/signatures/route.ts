import { NextRequest } from 'next/server'
import { createHash } from 'crypto'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { CODE_HTTP } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'

const MAX_SIZE = 500 * 1024 // 500 KB dataURL

type Payload = {
  dataUrl?: string
  type?: 'ADMIN' | 'SUPER_ADMIN'
}

type CloudinaryConfig = {
  cloudName: string
  apiKey: string
  apiSecret: string
  uploadPreset: string
}

function parseDataUrl(dataUrl: string): { buffer: Buffer; mime: string } {
  const match = /^data:(.+);base64,(.+)$/i.exec(dataUrl || '')
  if (!match) {
    throw new ErreurHttp(CODE_HTTP.MAUVAISE_REQUETE, 'Signature invalide (data URL).')
  }
  const mime = match[1]
  const b64 = match[2]
  const buffer = Buffer.from(b64, 'base64')
  if (buffer.length > MAX_SIZE) {
    throw new ErreurHttp(CODE_HTTP.MAUVAISE_REQUETE, 'Signature trop volumineuse (500KB max).')
  }
  return { buffer, mime }
}

function parserCloudinaryUrl(valeur: string): Partial<CloudinaryConfig> | null {
  const brute = String(valeur || '').trim()
  if (!brute || !brute.startsWith('cloudinary://')) return null

  try {
    const sansProtocole = brute.slice('cloudinary://'.length)
    const [authPart, cloudNamePart] = sansProtocole.split('@')
    const [apiKeyPart, apiSecretPart] = String(authPart || '').split(':')
    return {
      cloudName: String(cloudNamePart || '').trim(),
      apiKey: String(apiKeyPart || '').trim(),
      apiSecret: String(apiSecretPart || '').trim(),
      uploadPreset: '',
    }
  } catch {
    return null
  }
}

function lireConfigCloudinary(): CloudinaryConfig {
  const depuisUrl = parserCloudinaryUrl(String(process.env.CLOUDINARY_URL || '')) || {}
  const config: CloudinaryConfig = {
    cloudName: String(process.env.CLOUDINARY_CLOUD_NAME || depuisUrl.cloudName || '').trim(),
    apiKey: String(process.env.CLOUDINARY_API_KEY || depuisUrl.apiKey || '').trim(),
    apiSecret: String(process.env.CLOUDINARY_API_SECRET || depuisUrl.apiSecret || '').trim(),
    uploadPreset: String(process.env.CLOUDINARY_UPLOAD_PRESET || '').trim(),
  }

  if (!config.cloudName) {
    throw new ErreurHttp(
      CODE_HTTP.ERREUR_INTERNE,
      'Cloudinary non configuré (CLOUDINARY_CLOUD_NAME manquant).'
    )
  }

  if (!config.uploadPreset && (!config.apiKey || !config.apiSecret)) {
    throw new ErreurHttp(
      CODE_HTTP.ERREUR_INTERNE,
      'Cloudinary non configuré (upload_preset ou paire API_KEY/API_SECRET requis).'
    )
  }

  return config
}

async function uploadToCloudinary(buffer: Buffer, mime: string): Promise<string> {
  const config = lireConfigCloudinary()
  // DEBUG LOG (temporaire) : informations de config (sans secrets)
  console.info('[signatures] upload config', {
    cloudName: config.cloudName,
    uploadPreset: config.uploadPreset,
    hasApiKey: Boolean(config.apiKey),
    hasApiSecret: Boolean(config.apiSecret),
    mode: config.uploadPreset ? 'unsigned' : 'signed',
    mime,
    size: buffer.length,
  })

  const form = new FormData()
  const uint = new Uint8Array(buffer)
  form.append('file', new Blob([uint.buffer], { type: mime }), `signature-${Date.now()}.png`)

  let mode: 'unsigned' | 'signed' = 'unsigned'
  if (config.uploadPreset) {
    form.append('upload_preset', config.uploadPreset)
  } else {
    const timestamp = Math.floor(Date.now() / 1000)
    const toSign = `timestamp=${timestamp}`
    const signature = createHash('sha1').update(`${toSign}${config.apiSecret}`).digest('hex')
    form.append('timestamp', String(timestamp))
    form.append('api_key', config.apiKey)
    form.append('signature', signature)
    mode = 'signed'
  }

  const url = `https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`
  const res = await fetch(url, { method: 'POST', body: form })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    console.error('[signatures] cloudinary upload failed', { status: res.status, statusText: res.statusText, txt })
    throw new ErreurHttp(
      CODE_HTTP.ERREUR_INTERNE,
      `Upload signature échoué (${mode}): ${txt || res.status}`
    )
  }
  const payload = (await res.json()) as { secure_url?: string; url?: string }
  const out = payload.secure_url || payload.url
  if (!out) {
    console.error('[signatures] cloudinary upload missing URL', payload)
    throw new ErreurHttp(CODE_HTTP.ERREUR_INTERNE, 'Upload signature: URL manquante')
  }
  return out
}

export const GET = executerAvecGestionErreurs(conteneurDependances.reponseHttp, async (requete: NextRequest) => {
  const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
  const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
  const contexte = await conteneurDependances.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
    jetonAcces
  )
  const role = String(contexte.utilisateur.role || '').toUpperCase()
  const adminFromUser = await conteneurDependances.prisma.admin.findFirst({
    where: { utilisateurId: contexte.utilisateur.id },
    select: { id: true },
  })
  const adminId = impersonation?.adminId || adminFromUser?.id || null
  const type = role === 'SUPER_ADMIN' && !adminId ? 'SUPER_ADMIN' : 'ADMIN'

  const signature = await conteneurDependances.prisma.signature.findFirst({
    where: { type, adminId },
    orderBy: { updatedAt: 'desc' },
  })
  return conteneurDependances.reponseHttp.succes(signature || {})
})

export const POST = executerAvecGestionErreurs(conteneurDependances.reponseHttp, async (req: NextRequest) => {
  conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(req)
  const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(req)
  const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(req)
  const contexte = await conteneurDependances.serviceContexteAuthentification.obtenirContexteDepuisJetonAcces(
    jetonAcces
  )
  const role = String(contexte.utilisateur.role || '').toUpperCase()
  const adminFromUser = await conteneurDependances.prisma.admin.findFirst({
    where: { utilisateurId: contexte.utilisateur.id },
    select: { id: true },
  })
  const adminId = impersonation?.adminId || adminFromUser?.id || null
  const isSuper = role === 'SUPER_ADMIN' && !adminId
  const body = (await req.json().catch(() => ({}))) as Payload
  if (!body.dataUrl) {
    throw new ErreurHttp(CODE_HTTP.MAUVAISE_REQUETE, 'Signature manquante.')
  }
  const { buffer, mime } = parseDataUrl(body.dataUrl)
  const imageUrl = await uploadToCloudinary(buffer, mime)
  const hash = createHash('sha256').update(buffer).digest('hex')

  const type: 'ADMIN' | 'SUPER_ADMIN' = isSuper ? 'SUPER_ADMIN' : 'ADMIN'

  // Une seule signature par admin/type : on supprime l'existante le cas échéant.
  await conteneurDependances.prisma.signature.deleteMany({
    where: { adminId, type },
  })
  const signature = await conteneurDependances.prisma.signature.create({
    data: { adminId, type, imageUrl, hash },
  })

  return conteneurDependances.reponseHttp.succes(signature)
})
