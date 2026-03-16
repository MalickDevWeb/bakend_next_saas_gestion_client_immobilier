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

async function uploadToCloudinary(buffer: Buffer, mime: string): Promise<string> {
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim()
  const uploadPreset = String(process.env.CLOUDINARY_UPLOAD_PRESET || '').trim()
  if (!cloudName) {
    throw new ErreurHttp(CODE_HTTP.ERREUR_INTERNE, 'Cloudinary non configuré (CLOUDINARY_CLOUD_NAME).')
  }

  // unsigned si preset disponible, sinon signé minimal (si clés)
  const form = new FormData()
  form.append('file', new Blob([buffer], { type: mime }), `signature-${Date.now()}.png`)
  if (uploadPreset) {
    form.append('upload_preset', uploadPreset)
  }
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
  const res = await fetch(url, { method: 'POST', body: form })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new ErreurHttp(CODE_HTTP.ERREUR_INTERNE, `Upload signature échoué: ${txt || res.status}`)
  }
  const payload = (await res.json()) as { secure_url?: string; url?: string }
  const out = payload.secure_url || payload.url
  if (!out) {
    throw new ErreurHttp(CODE_HTTP.ERREUR_INTERNE, 'Upload signature: URL manquante')
  }
  return out
}

export const GET = executerAvecGestionErreurs(conteneurDependances.reponseHttp, async () => {
  const auth = await conteneurDependances.serviceSecurite.lireContexteAuthentification()
  const adminId = auth.adminId || null
  const type = auth.role === 'SUPER_ADMIN' && !adminId ? 'SUPER_ADMIN' : 'ADMIN'

  const signature = await conteneurDependances.prisma.signature.findFirst({
    where: { type, adminId },
    orderBy: { updatedAt: 'desc' },
  })
  return conteneurDependances.reponseHttp.succes(signature || {})
})

export const POST = executerAvecGestionErreurs(conteneurDependances.reponseHttp, async (req: NextRequest) => {
  const auth = await conteneurDependances.serviceSecurite.lireContexteAuthentification()
  const adminId = auth.adminId || null
  const isSuper = auth.role === 'SUPER_ADMIN' && !adminId
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
